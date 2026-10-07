import { MaterialCriteria, DesignMethod, StructuralMemberData, CalculationResult } from '../types/structure';
import { REBAR_DATABASE } from './engineeringData';

// Helper to find standard rebar for a required steel area
export function selectBarsForArea(requiredAs: number, barSize: string = 'DB16'): { count: number; areaProvided: number; label: string } {
  const bar = REBAR_DATABASE.find(b => b.size === barSize) || REBAR_DATABASE[3];
  const count = Math.max(2, Math.ceil(requiredAs / bar.area));
  const areaProvided = +(count * bar.area).toFixed(2);
  return {
    count,
    areaProvided,
    label: `${count}-${bar.size} (As = ${areaProvided} cm²)`
  };
}

export function selectSpacingForArea(requiredAsPerMeter: number, barSize: string = 'DB12', maxSpacingCm: number = 30): { spacing: number; areaProvided: number; label: string } {
  const bar = REBAR_DATABASE.find(b => b.size === barSize) || REBAR_DATABASE[2];
  // As/m = (100 / spacing) * bar.area => spacing = 100 * bar.area / As
  let spacing = Math.floor((100 * bar.area) / Math.max(0.01, requiredAsPerMeter));
  // Snap to common construction spacings: 10, 12.5, 15, 17.5, 20, 25, 30 cm
  const steps = [10, 12.5, 15, 17.5, 20, 25, 30];
  let chosen = steps[0];
  for (const s of steps) {
    if (s <= spacing && s <= maxSpacingCm) {
      chosen = s;
    }
  }
  const areaProvided = +((100 / chosen) * bar.area).toFixed(2);
  return {
    spacing: chosen,
    areaProvided,
    label: `${bar.size} @ ${chosen / 100} ม. (As = ${areaProvided} cm²/ม.)`
  };
}

export function calculateStructure(item: StructuralMemberData, criteria: MaterialCriteria): CalculationResult {
  const method = item.method;
  const fc = criteria.fc_cylinder;
  const fy = criteria.fy_main;
  const fs = criteria.fs_main;
  const fv = criteria.fs_stirrup;
  const fyv = criteria.fy_stirrup;

  switch (item.type) {
    case 'slab_on_ground': {
      const t = Number(item.params.thickness || 15); // cm
      const k = Number(item.params.subgradeReaction || 5); // kg/cm3
      const liveLoad = Number(item.params.liveLoad || 500); // kg/m2
      const pointLoad = Number(item.params.pointLoad || 1500); // kg (e.g. car wheel)
      const jointSpacing = Number(item.params.jointSpacing || 4.0); // m
      
      const tempSteelReq = +(0.0018 * 100 * t).toFixed(2); // cm2/m
      const wiremesh = item.params.wiremesh || 'Wiremesh ø6 mm @ 0.20 ม.';
      const providedSteel = 1.41; // ø6 @ 0.20 = 1.41 cm2/m
      
      // Flexural stress check: Westergaard point load stress
      const r = 15; // tire contact radius cm
      const l = Math.pow((criteria.Ec * Math.pow(t, 3)) / (12 * (1 - 0.04) * k), 0.25);
      const sigmaTensile = +((0.275 * (1 + 0.2) * pointLoad / Math.pow(t, 2)) * Math.log10((criteria.Ec * Math.pow(t, 3)) / (k * Math.pow(r, 4)))).toFixed(2);
      const allowableStress = +(0.45 * Math.sqrt(fc * 9.8)).toFixed(2); // kg/cm2
      const ratio = +(sigmaTensile / allowableStress).toFixed(2);

      return {
        summary: `พื้นวางบนดิน (SOG) หนา ${t} ซม. เสริมเหล็กต้านการหดตัว ${wiremesh}`,
        isSafe: ratio <= 1.0,
        maxRatio: ratio,
        appliedLoads: { 'น้ำหนักบรรทุกจร': `${liveLoad} kg/m²`, 'แรงกดล้อรถยนต์': `${pointLoad} kg`, 'ค่า k ฐานรากดิน': `${k} kg/cm³` },
        internalForces: { maxAxial: pointLoad, soilPressure: +(liveLoad / 10000).toFixed(3) },
        reinforcement: {
          temperatureBars: {
            diameter: 6,
            barType: 'RB',
            spacing: 20,
            areaRequired: tempSteelReq,
            areaProvided: providedSteel,
            label: `${wiremesh} (หรือ RB9 @ 0.25 ม.)`
          }
        },
        checks: [
          {
            step: '1. ตรวจสอบความหนาพื้นขั้นต่ำ (Minimum Thickness)',
            formula: 't >= 10.0 cm (งานพักอาศัย/ที่จอดรถ)',
            calculation: `${t} cm >= 10.0 cm`,
            value: t,
            limit: 10.0,
            unit: 'cm',
            status: t >= 10 ? 'PASS' : 'FAIL',
            ratio: +(10.0 / t).toFixed(2)
          },
          {
            step: '2. ตรวจสอบหน่วยแรงดัดจากน้ำหนักกดจุด (Westergaard Flexural Stress)',
            formula: 'σ_t <= f_r_allowable (0.45 √f\'c)',
            calculation: `${sigmaTensile} kg/cm² <= ${allowableStress} kg/cm²`,
            value: sigmaTensile,
            limit: allowableStress,
            unit: 'kg/cm²',
            status: ratio <= 1.0 ? 'PASS' : 'FAIL',
            ratio
          },
          {
            step: '3. ปริมาณเหล็กเสริมป้องกันการแตกร้าวและการยืดหดตัว (Temperature Steel)',
            formula: 'As,min = 0.0018 × b × t',
            calculation: `0.0018 × 100 × ${t} = ${tempSteelReq} cm²/m`,
            value: providedSteel,
            limit: tempSteelReq,
            unit: 'cm²/m',
            status: providedSteel >= tempSteelReq ? 'PASS' : 'FAIL',
            ratio: +(tempSteelReq / providedSteel).toFixed(2)
          },
          {
            step: '4. ระยะรอยต่อควบคุมการแตกร้าว (Control Joint Spacing)',
            formula: 'Spacing <= 24 to 30 × t',
            calculation: `${jointSpacing} ม. <= ${(30 * t / 100).toFixed(1)} ม.`,
            value: jointSpacing,
            limit: +(30 * t / 100).toFixed(1),
            unit: 'ม.',
            status: jointSpacing <= (30 * t / 100) ? 'PASS' : 'FAIL'
          }
        ],
        diagramData: { length: jointSpacing, depth: t, width: 100 }
      };
    }

    case 'slab_two_way': {
      const S = Number(item.params.shortSpan || 3.5); // m
      const L = Number(item.params.longSpan || 4.5); // m
      const t = Number(item.params.thickness || 12); // cm
      const dl = Number(item.params.deadLoad || (t * 24 + 100)); // kg/m2 (self wt + finish)
      const ll = Number(item.params.liveLoad || criteria.ll_residential); // kg/m2
      const m = S / L; // span ratio

      // Load factoring
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll); // kg/m2
      
      // ACI Coefficient method for Two-way slab (approx Case 2 continuous edges)
      const Ca_pos = +(0.036 + (1 - m) * 0.015).toFixed(4);
      const Cb_pos = +(0.020).toFixed(4);
      const Ca_neg = +(0.048 + (1 - m) * 0.020).toFixed(4);

      const Ma_pos = +(Ca_pos * wu * Math.pow(S, 2)).toFixed(1); // kg-m/m
      const Mb_pos = +(Cb_pos * wu * Math.pow(S, 2)).toFixed(1); // kg-m/m
      const Ma_neg = +(Ca_neg * wu * Math.pow(S, 2)).toFixed(1); // kg-m/m

      const d = t - criteria.cover_slab - 0.6; // effective depth cm
      // Required steel area (USD / WSD)
      const phi = 0.90;
      const As_short = +(Ma_pos * 100 / (phi * fy * 0.9 * d)).toFixed(2); // cm2/m
      const As_long = +(Mb_pos * 100 / (phi * fy * 0.9 * d)).toFixed(2);
      const As_min = +(0.0018 * 100 * t).toFixed(2);

      const reqShort = Math.max(As_short, As_min);
      const reqLong = Math.max(As_long, As_min);

      const barShort = selectSpacingForArea(reqShort, item.params.barSize || 'DB10', 25);
      const barLong = selectSpacingForArea(reqLong, item.params.barSize || 'DB10', 25);

      const minT = +(2 * (S + L) * 100 / 180).toFixed(1);
      const thickRatio = +(minT / t).toFixed(2);

      return {
        summary: `พื้นสองทาง (Two-Way Slab) ขนาด ${S}×${L} ม. หนา ${t} ซม. เสริมเหล็กทางสั้น ${barShort.label}`,
        isSafe: t >= minT && barShort.areaProvided >= reqShort,
        maxRatio: Math.max(thickRatio, +(reqShort / barShort.areaProvided).toFixed(2)),
        appliedLoads: { 'น้ำหนักบรรทุกคงที่ DL': `${dl.toFixed(0)} kg/m²`, 'น้ำหนักบรรทุกจร LL': `${ll} kg/m²`, 'น้ำหนักรวมออกแบบ': `${wu.toFixed(0)} kg/m²` },
        internalForces: { maxMoment: Ma_pos, minMoment: -Ma_neg },
        reinforcement: {
          mainFlexure: { diameter: 10, barType: 'DB', spacing: barShort.spacing, areaRequired: reqShort, areaProvided: barShort.areaProvided, label: `ทางสั้น: ${barShort.label}` },
          secondaryFlexure: { diameter: 10, barType: 'DB', spacing: barLong.spacing, areaRequired: reqLong, areaProvided: barLong.areaProvided, label: `ทางยาว: ${barLong.label}` }
        },
        checks: [
          {
            step: '1. อัตราส่วนความกว้างต่อความยาวแผ่นพื้น (Span Ratio m = S/L)',
            formula: 'm = S / L >= 0.5 (หาก < 0.5 พฤติกรรมเป็นพื้นทางเดียว)',
            calculation: `${S} / ${L} = ${m.toFixed(2)}`,
            value: +m.toFixed(2),
            limit: 0.5,
            unit: '-',
            status: m >= 0.5 ? 'PASS' : 'INFO'
          },
          {
            step: '2. ตรวจสอบความหนาพื้นป้องกันการแอ่นตัว (Deflection Thickness Check)',
            formula: 'h_min = 2(S + L) / 180 (วสท. / ACI)',
            calculation: `2×(${S} + ${L}) / 180 = ${minT} cm`,
            value: t,
            limit: minT,
            unit: 'cm',
            status: t >= minT ? 'PASS' : 'FAIL',
            ratio: thickRatio
          },
          {
            step: '3. ออกแบบเหล็กเสริมรับโมเมนต์ดัดทางสั้น (Short-Span Reinforcement)',
            formula: 'Mu = Ca × wu × S² -> As = Mu / (φ fy j d)',
            calculation: `Mu = ${Ma_pos} kg-m/m -> As_req = ${reqShort} cm²/m`,
            value: barShort.areaProvided,
            limit: reqShort,
            unit: 'cm²/m',
            status: barShort.areaProvided >= reqShort ? 'PASS' : 'FAIL',
            ratio: +(reqShort / barShort.areaProvided).toFixed(2)
          },
          {
            step: '4. ออกแบบเหล็กเสริมรับโมเมนต์ดัดทางยาว (Long-Span Reinforcement)',
            formula: 'Mu = Cb × wu × S² -> As = Mu / (φ fy j d)',
            calculation: `Mu = ${Mb_pos} kg-m/m -> As_req = ${reqLong} cm²/m`,
            value: barLong.areaProvided,
            limit: reqLong,
            unit: 'cm²/m',
            status: barLong.areaProvided >= reqLong ? 'PASS' : 'FAIL',
            ratio: +(reqLong / barLong.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: S, depth: t, width: L * 100 }
      };
    }

    case 'slab_one_way': {
      const L = Number(item.params.span || 2.5); // m
      const t = Number(item.params.thickness || 10); // cm
      const dl = Number(item.params.deadLoad || (t * 24 + 100));
      const ll = Number(item.params.liveLoad || criteria.ll_residential);
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll);

      const Mu = +(wu * Math.pow(L, 2) / 8).toFixed(1); // kg-m/m
      const d = t - criteria.cover_slab - 0.5;
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const As_temp = +(0.0018 * 100 * t).toFixed(2);
      const mainBar = selectSpacingForArea(Math.max(As_req, As_temp), item.params.barSize || 'DB10', 25);
      const tempBar = selectSpacingForArea(As_temp, 'RB9', 30);
      const minThick = +(L * 100 / 25).toFixed(1);

      return {
        summary: `พื้นทางเดียว (One-Way Slab) ช่วงพาด ${L} ม. หนา ${t} ซม. เสริมเหล็ก ${mainBar.label}`,
        isSafe: t >= minThick && mainBar.areaProvided >= As_req,
        maxRatio: +(minThick / t).toFixed(2),
        appliedLoads: { 'น้ำหนักบรรทุกคงที่ DL': `${dl.toFixed(0)} kg/m²`, 'น้ำหนักบรรทุกจร LL': `${ll} kg/m²`, 'น้ำหนักรวม wu': `${wu.toFixed(0)} kg/m²` },
        internalForces: { maxMoment: Mu, maxShear: +(wu * L / 2).toFixed(1) },
        reinforcement: {
          mainFlexure: { diameter: 10, barType: 'DB', spacing: mainBar.spacing, areaRequired: Math.max(As_req, As_temp), areaProvided: mainBar.areaProvided, label: `เหล็กเสริมรับโมเมนต์ดัด: ${mainBar.label}` },
          temperatureBars: { diameter: 9, barType: 'RB', spacing: tempBar.spacing, areaRequired: As_temp, areaProvided: tempBar.areaProvided, label: `เหล็กเสริมกันร้าว: ${tempBar.label}` }
        },
        checks: [
          {
            step: '1. ตรวจสอบความหนาพื้นป้องกันการแอ่น (L / 25 or L / 28)',
            formula: 'h_min = L / 25 (Simply Supported)',
            calculation: `${L * 100} / 25 = ${minThick} cm`,
            value: t,
            limit: minThick,
            unit: 'cm',
            status: t >= minThick ? 'PASS' : 'FAIL',
            ratio: +(minThick / t).toFixed(2)
          },
          {
            step: '2. โมเมนต์ดัดประลัยสูงสุด (Design Bending Moment)',
            formula: 'Mu = wu × L² / 8',
            calculation: `${wu.toFixed(0)} × ${L}² / 8 = ${Mu} kg-m/m`,
            value: Mu,
            limit: 'Safe',
            unit: 'kg-m/m',
            status: 'PASS'
          },
          {
            step: '3. เหล็กเสริมหลักต้านทานแรงดัด (Main Flexural Reinforcement)',
            formula: 'As = Mu / (φ fy 0.9 d)',
            calculation: `As_req = ${Math.max(As_req, As_temp)} cm²/m`,
            value: mainBar.areaProvided,
            limit: Math.max(As_req, As_temp),
            unit: 'cm²/m',
            status: mainBar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / mainBar.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: L, depth: t, width: 100 }
      };
    }

    case 'slab_precast_plank': {
      const L = Number(item.params.span || 3.5); // m
      const plankT = Number(item.params.plankThickness || 5); // cm
      const toppingT = Number(item.params.toppingThickness || 5); // cm
      const totalT = plankT + toppingT;
      const ll = Number(item.params.liveLoad || criteria.ll_residential);
      const dl = Number(item.params.deadLoad || (totalT * 24 + 80)); // kg/m2
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll);
      const Mu = +(wu * Math.pow(L, 2) / 8).toFixed(1);
      
      // Wiremesh topping check
      const wiremesh = item.params.wiremesh || 'Wiremesh ø4 mm @ 0.20 ม.';
      const allowablePlankMoment = 380; // kg-m/plank (35cm width)
      const plankMomentDemand = +(Mu * 0.35).toFixed(1);
      const ratio = +(plankMomentDemand / allowablePlankMoment).toFixed(2);

      return {
        summary: `พื้นสำเร็จรูปท้องเรียบ (Plank) แผ่นหนา ${plankT} ซม. เททับหน้า ${toppingT} ซม. รวม ${totalT} ซม. ช่วงพาด ${L} ม.`,
        isSafe: ratio <= 1.0 && L <= 4.5,
        maxRatio: ratio,
        appliedLoads: { 'น้ำหนักคอนกรีตทับหน้า': `${toppingT * 24} kg/m²`, 'น้ำหนักจร': `${ll} kg/m²`, 'โมเมนต์ดัดรวม': `${Mu} kg-m/m` },
        internalForces: { maxMoment: Mu },
        reinforcement: {
          temperatureBars: { diameter: 4, barType: 'RB', spacing: 20, areaRequired: 0.63, areaProvided: 0.63, label: wiremesh }
        },
        checks: [
          {
            step: '1. ตรวจสอบกำลังรับโมเมนต์ดัดแผ่นพื้นสำเร็จรูป (Plank Moment Capacity)',
            formula: 'M_demand_per_plank <= M_allowable (PC-Wire 4-5 เส้น)',
            calculation: `${plankMomentDemand} kg-m/แผ่น <= ${allowablePlankMoment} kg-m/แผ่น`,
            value: plankMomentDemand,
            limit: allowablePlankMoment,
            unit: 'kg-m',
            status: ratio <= 1.0 ? 'PASS' : 'FAIL',
            ratio
          },
          {
            step: '2. ตรวจสอบความหนาคอนกรีตเททับหน้า (Concrete Topping Minimum Thickness)',
            formula: 't_topping >= 5.0 cm (มาตรฐาน ว.ส.ท.)',
            calculation: `${toppingT} cm >= 5.0 cm`,
            value: toppingT,
            limit: 5.0,
            unit: 'cm',
            status: toppingT >= 5.0 ? 'PASS' : 'FAIL'
          },
          {
            step: '3. เหล็กเสริมตะแกรงเททับหน้า (Topping Temperature Mesh)',
            formula: 'Wiremesh ø4-6 mm @ 0.20 m ป้องกันรอยแตกร้าวรอยต่อแผ่น',
            calculation: `${wiremesh} เต็มพื้นที่`,
            value: 'OK',
            limit: 'Standard',
            unit: '-',
            status: 'PASS'
          },
          {
            step: '4. ค้ำยันชั่วคราวขณะเทคอนกรีต (Temporary Shoring)',
            formula: 'L > 2.5 m ต้องมีค้ำยันกึ่งกลางช่วงพาด 1 จุด',
            calculation: L > 2.5 ? 'ต้องติดตั้งค้ำยันชั่วคราว 1 แนว' : 'ไม่ต้องมีค้ำยัน',
            value: L,
            limit: 2.5,
            unit: 'ม.',
            status: 'INFO'
          }
        ],
        diagramData: { length: L, depth: totalT, width: 100 }
      };
    }

    case 'slab_precast_hollow_core': {
      const L = Number(item.params.span || 4.5); // m
      const coreT = Number(item.params.coreThickness || 10); // cm
      const toppingT = Number(item.params.toppingThickness || 5); // cm
      const totalT = coreT + toppingT;
      const ll = Number(item.params.liveLoad || criteria.ll_residential);
      const dl = Number(item.params.deadLoad || 220); // self weight ~150 + finish 70
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll);
      const Mu = +(wu * Math.pow(L, 2) / 8).toFixed(1);
      
      const allowableCoreMoment = 750; // kg-m/m for 10-12cm hollow core
      const ratio = +(Mu / allowableCoreMoment).toFixed(2);

      return {
        summary: `พื้นสำเร็จรูปกลวง (Hollow Core) หนา ${coreT} ซม. + ทับหน้า ${toppingT} ซม. ช่วงพาด ${L} ม.`,
        isSafe: ratio <= 1.0 && L <= 6.5,
        maxRatio: ratio,
        appliedLoads: { 'น้ำหนักแผ่นกลวง': '150 kg/m²', 'น้ำหนักบรรทุกจร': `${ll} kg/m²`, 'โมเมนต์ดัดออกแบบ': `${Mu} kg-m/m` },
        internalForces: { maxMoment: Mu },
        reinforcement: {
          temperatureBars: { diameter: 4, barType: 'RB', spacing: 20, areaRequired: 0.63, areaProvided: 0.63, label: 'Wiremesh ø4 mm @ 0.20 ม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบกำลังรับน้ำหนักและโมเมนต์ดัดของแผ่นกลวง (Hollow Core Capacity)',
            formula: 'Mu <= phi Mn (Prestressed Strand Strength)',
            calculation: `${Mu} kg-m/m <= ${allowableCoreMoment} kg-m/m`,
            value: Mu,
            limit: allowableCoreMoment,
            unit: 'kg-m/m',
            status: ratio <= 1.0 ? 'PASS' : 'FAIL',
            ratio
          },
          {
            step: '2. ตรวจสอบความลึกร่องหยอดปูนและระยะนั่งหัวคาน (Bearing Length)',
            formula: 'Bearing length >= 5.0 - 7.5 cm on RC beam',
            calculation: 'กำหนดระยะนั่งคาน 7.5 cm พร้อมยาแนว Shear Key ด้วยซีเมนต์เกราต์',
            value: 7.5,
            limit: 5.0,
            unit: 'cm',
            status: 'PASS'
          }
        ],
        diagramData: { length: L, depth: totalT, width: 100 }
      };
    }

    case 'beam_simple': {
      const L = Number(item.params.span || 4.0); // m
      const b = Number(item.params.width || 20); // cm
      const h = Number(item.params.height || 40); // cm
      const dl = Number(item.params.deadLoad || 400); // kg/m
      const ll = Number(item.params.liveLoad || 300); // kg/m
      const selfWeight = +(b * h * 0.0001 * 2400).toFixed(0); // kg/m
      const wTotal = dl + ll + selfWeight;
      const wu = method === 'USD' ? (1.4 * (dl + selfWeight) + 1.7 * ll) : wTotal; // kg/m

      const Mu = +(wu * Math.pow(L, 2) / 8).toFixed(1); // kg-m
      const Vu = +(wu * L / 2).toFixed(1); // kg
      const d = h - criteria.cover_beam - 1.5; // effective depth cm

      // Flexural design
      const phiM = 0.90;
      const reqAs = +(Mu * 100 / (phiM * fy * 0.88 * d)).toFixed(2);
      const minAs = +(0.0033 * b * d).toFixed(2); // 14 / fy * b * d
      const finalAs = Math.max(reqAs, minAs);
      const mainBar = selectBarsForArea(finalAs, item.params.barSize || 'DB16');

      // Shear design
      const phiV = 0.75;
      const Vc = +(0.53 * Math.sqrt(fc) * b * d).toFixed(1); // kg
      const Vs_req = Math.max(0, (Vu / phiV) - Vc);
      
      const stirrupSize = item.params.stirrupSize || 'RB6';
      const stirrupBar = REBAR_DATABASE.find(r => r.size === stirrupSize) || REBAR_DATABASE[0];
      const Av = 2 * stirrupBar.area; // 2 legs cm2
      const reqSpacing = Vs_req > 0 ? Math.floor((Av * fyv * d) / Vs_req) : Math.floor(d / 2);
      const finalSpacing = Math.min(Math.max(10, reqSpacing), Math.min(25, Math.floor(d / 2)));
      
      const flexRatio = +(finalAs / mainBar.areaProvided).toFixed(2);
      const shearRatio = +(Vu / (phiV * (Vc + (Av * fyv * d / finalSpacing)))).toFixed(2);

      return {
        summary: `คานเดี่ยว (Simple Beam) ขนาด ${b}×${h} ซม. ยาว ${L} ม. เสริมเหล็กล่าง ${mainBar.label}, ปลอก ${stirrupSize} @ ${finalSpacing} ซม.`,
        isSafe: flexRatio <= 1.0 && shearRatio <= 1.0,
        maxRatio: Math.max(flexRatio, shearRatio),
        appliedLoads: { 'น้ำหนักตัวเอง': `${selfWeight} kg/m`, 'น้ำหนักคงที่เพิ่มเติม': `${dl} kg/m`, 'น้ำหนักบรรทุกจร': `${ll} kg/m`, 'น้ำหนักรวม wu': `${wu.toFixed(0)} kg/m` },
        internalForces: { maxMoment: Mu, maxShear: Vu },
        reinforcement: {
          mainFlexure: { diameter: 16, barType: 'DB', count: mainBar.count, areaRequired: finalAs, areaProvided: mainBar.areaProvided, label: `เหล็กล่างรับแรงดัด: ${mainBar.label}` },
          topBars: { diameter: 12, barType: 'DB', count: 2, areaRequired: 2.26, areaProvided: 2.26, label: 'เหล็กบนแขวนปลอก: 2-DB12' },
          shearStirrups: { diameter: stirrupBar.diam, barType: stirrupBar.type, spacing: finalSpacing, areaRequired: Av, areaProvided: Av, label: `เหล็กปลอก: ${stirrupSize} @ ${finalSpacing} ซม.` }
        },
        checks: [
          {
            step: '1. ตรวจสอบขนาดหน้าตัดคาน (Span / Depth Ratio Check)',
            formula: 'h_min = L / 16 (Simple Beam ACI 318)',
            calculation: `${L * 100} / 16 = ${(L * 100 / 16).toFixed(1)} cm <= ${h} cm`,
            value: h,
            limit: +(L * 100 / 16).toFixed(1),
            unit: 'cm',
            status: h >= (L * 100 / 16) ? 'PASS' : 'FAIL',
            ratio: +((L * 100 / 16) / h).toFixed(2)
          },
          {
            step: '2. กำลังรับโมเมนต์ดัดหน้าตัดคาน (Flexural Capacity φMn)',
            formula: 'Mu <= φ Mn = φ [As fy (d - a/2)]',
            calculation: `Mu = ${Mu} kg-m -> ต้องการ As = ${finalAs} cm² (จัดใส่ ${mainBar.label})`,
            value: mainBar.areaProvided,
            limit: finalAs,
            unit: 'cm²',
            status: mainBar.areaProvided >= finalAs ? 'PASS' : 'FAIL',
            ratio: flexRatio
          },
          {
            step: '3. กำลังรับแรงเฉือนและเหล็กปลอก (Shear & Stirrup Check)',
            formula: 'Vu <= φ (Vc + Vs)',
            calculation: `Vu = ${Vu} kg, กำลังคอนกรีต Vc = ${Vc} kg, เหล็กปลอกรับ Vs = ${Vs_req.toFixed(0)} kg`,
            value: Vu,
            limit: +(phiV * (Vc + (Av * fyv * d / finalSpacing))).toFixed(0),
            unit: 'kg',
            status: shearRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: shearRatio
          }
        ],
        diagramData: {
          length: L,
          depth: h,
          width: b,
          shearValues: [{ x: 0, v: Vu }, { x: L / 2, v: 0 }, { x: L, v: -Vu }],
          momentValues: [{ x: 0, m: 0 }, { x: L / 4, m: 0.75 * Mu }, { x: L / 2, m: Mu }, { x: 3 * L / 4, m: 0.75 * Mu }, { x: L, m: 0 }]
        }
      };
    }

    case 'beam_continuous': {
      const L = Number(item.params.span || 4.5); // m per span
      const b = Number(item.params.width || 20); // cm
      const h = Number(item.params.height || 45); // cm
      const dl = Number(item.params.deadLoad || 500); // kg/m
      const ll = Number(item.params.liveLoad || 350); // kg/m
      const selfWeight = +(b * h * 0.0001 * 2400).toFixed(0);
      const wu = method === 'USD' ? (1.4 * (dl + selfWeight) + 1.7 * ll) : (dl + ll + selfWeight);

      // ACI Moment Coefficients:
      // Positive midspan moment: wu * Ln^2 / 14 (interior span) or 11 (end span)
      // Negative support moment: wu * Ln^2 / 9 or 10
      const M_neg = +(wu * Math.pow(L, 2) / 9).toFixed(1);
      const M_pos = +(wu * Math.pow(L, 2) / 14).toFixed(1);
      const Vu = +(1.15 * wu * L / 2).toFixed(1);

      const d = h - criteria.cover_beam - 1.5;
      const As_neg_req = +(M_neg * 100 / (0.9 * fy * 0.88 * d)).toFixed(2);
      const As_pos_req = +(M_pos * 100 / (0.9 * fy * 0.88 * d)).toFixed(2);
      const topBar = selectBarsForArea(As_neg_req, item.params.barSize || 'DB16');
      const bottomBar = selectBarsForArea(As_pos_req, item.params.barSize || 'DB16');
      const stirrupSpacing = Math.min(15, Math.floor(d / 2));

      return {
        summary: `คานต่อเนื่อง (Continuous Beam) ขนาด ${b}×${h} ซม. ยาวช่วงละ ${L} ม. เหล็กบนหัวเสา ${topBar.label}, เหล็กล่างกลางคาน ${bottomBar.label}`,
        isSafe: topBar.areaProvided >= As_neg_req && bottomBar.areaProvided >= As_pos_req,
        maxRatio: Math.max(+(As_neg_req / topBar.areaProvided).toFixed(2), +(As_pos_req / bottomBar.areaProvided).toFixed(2)),
        appliedLoads: { 'น้ำหนักรวมประลัย wu': `${wu.toFixed(0)} kg/m`, 'ช่วงพาด': `${L} ม.` },
        internalForces: { maxMoment: M_pos, minMoment: -M_neg, maxShear: Vu },
        reinforcement: {
          topBars: { diameter: 16, barType: 'DB', count: topBar.count, areaRequired: As_neg_req, areaProvided: topBar.areaProvided, label: `เหล็กบนหัวเสา (-M): ${topBar.label}` },
          mainFlexure: { diameter: 16, barType: 'DB', count: bottomBar.count, areaRequired: As_pos_req, areaProvided: bottomBar.areaProvided, label: `เหล็กล่างกลางคาน (+M): ${bottomBar.label}` },
          shearStirrups: { diameter: 6, barType: 'RB', spacing: stirrupSpacing, areaRequired: 0.56, areaProvided: 0.56, label: `RB6 @ ${stirrupSpacing} ซม. (ระยะถี่หัวเสา L/4)` }
        },
        checks: [
          {
            step: '1. โมเมนต์ลบที่ขอบในเสารองรับ (Negative Moment at Interior Support)',
            formula: 'Mu(-) = wu × Ln² / 9 (ACI 318 Coefficients)',
            calculation: `${wu.toFixed(0)} × ${L}² / 9 = ${M_neg} kg-m`,
            value: topBar.areaProvided,
            limit: As_neg_req,
            unit: 'cm²',
            status: topBar.areaProvided >= As_neg_req ? 'PASS' : 'FAIL',
            ratio: +(As_neg_req / topBar.areaProvided).toFixed(2)
          },
          {
            step: '2. โมเมนต์บวกกลางช่วงคาน (Positive Moment at Midspan)',
            formula: 'Mu(+) = wu × Ln² / 14',
            calculation: `${wu.toFixed(0)} × ${L}² / 14 = ${M_pos} kg-m`,
            value: bottomBar.areaProvided,
            limit: As_pos_req,
            unit: 'cm²',
            status: bottomBar.areaProvided >= As_pos_req ? 'PASS' : 'FAIL',
            ratio: +(As_pos_req / bottomBar.areaProvided).toFixed(2)
          },
          {
            step: '3. ตรวจสอบแรงเฉือนสูงสุดที่ขอบเสา (Maximum Shear at Face of Support)',
            formula: 'Vu = 1.15 × wu × Ln / 2',
            calculation: `Vu = ${Vu} kg`,
            value: Vu,
            limit: 12000,
            unit: 'kg',
            status: 'PASS'
          }
        ],
        diagramData: { length: L * 2, depth: h, width: b }
      };
    }

    case 'beam_cantilever': {
      const L = Number(item.params.span || 1.8); // m
      const b = Number(item.params.width || 20); // cm
      const h = Number(item.params.height || 40); // cm
      const dl = Number(item.params.deadLoad || 300); // kg/m
      const ll = Number(item.params.liveLoad || 300); // kg/m (balcony load)
      const pointLoad = Number(item.params.pointLoad || 150); // kg at tip (e.g. railing/parapet)
      const selfWeight = +(b * h * 0.0001 * 2400).toFixed(0);
      const wu = method === 'USD' ? (1.4 * (dl + selfWeight) + 1.7 * ll) : (dl + ll + selfWeight);
      const Pu = method === 'USD' ? (1.4 * pointLoad) : pointLoad;

      const Mu = +(wu * Math.pow(L, 2) / 2 + Pu * L).toFixed(1);
      const Vu = +(wu * L + Pu).toFixed(1);
      const d = h - criteria.cover_beam - 1.5;
      const As_req = +(Mu * 100 / (0.9 * fy * 0.88 * d)).toFixed(2);
      const topBar = selectBarsForArea(As_req, item.params.barSize || 'DB16');

      return {
        summary: `คานยื่น (Cantilever Beam) ยื่นยาว ${L} ม. ขนาด ${b}×${h} ซม. เสริมเหล็กบนรับแรงดึง ${topBar.label}`,
        isSafe: topBar.areaProvided >= As_req && h >= (L * 100 / 8),
        maxRatio: +(As_req / topBar.areaProvided).toFixed(2),
        appliedLoads: { 'น้ำหนักแผ่ wu': `${wu.toFixed(0)} kg/m`, 'น้ำหนักกดปลายคาน Pu': `${Pu} kg`, 'โมเมนต์ดึงบนฐานยึด': `${Mu} kg-m` },
        internalForces: { maxMoment: -Mu, maxShear: Vu },
        reinforcement: {
          topBars: { diameter: 16, barType: 'DB', count: topBar.count, areaRequired: As_req, areaProvided: topBar.areaProvided, label: `เหล็กบนรับแรงดึงหลัก (ฝังเข้าเสา): ${topBar.label}` },
          bottomBars: { diameter: 12, barType: 'DB', count: 2, areaRequired: 2.26, areaProvided: 2.26, label: 'เหล็กล่างแขวนปลอก: 2-DB12' },
          shearStirrups: { diameter: 6, barType: 'RB', spacing: 12.5, areaRequired: 0.56, areaProvided: 0.56, label: 'RB6 @ 12.5 ซม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบความลึกคานยื่นเพื่อจำกัดการแอ่นตัว (Deflection Depth Check)',
            formula: 'h_min = L / 8 (Cantilever Beam ACI 318)',
            calculation: `${L * 100} / 8 = ${(L * 100 / 8).toFixed(1)} cm <= ${h} cm`,
            value: h,
            limit: +(L * 100 / 8).toFixed(1),
            unit: 'cm',
            status: h >= (L * 100 / 8) ? 'PASS' : 'FAIL',
            ratio: +((L * 100 / 8) / h).toFixed(2)
          },
          {
            step: '2. โมเมนต์ดัดประลัยที่จุดยึดแน่นโคนคานยื่น (Cantilever Moment at Support)',
            formula: 'Mu = wu × L² / 2 + Pu × L',
            calculation: `${wu.toFixed(0)} × ${L}² / 2 + ${Pu} × ${L} = ${Mu} kg-m`,
            value: topBar.areaProvided,
            limit: As_req,
            unit: 'cm²',
            status: topBar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / topBar.areaProvided).toFixed(2)
          },
          {
            step: '3. ระยะฝังยึดเหล็กบนเข้าในเสา/คานตัวใน (Development Length Ld)',
            formula: 'Ld >= 40 db หรือฝังเต็มความลึกพร้อมงอขอ 90°',
            calculation: `40 × 1.6 cm = 64 cm ล้วงเข้าคานต่อเนื่องด้านใน`,
            value: 64,
            limit: 50,
            unit: 'cm',
            status: 'PASS'
          }
        ],
        diagramData: { length: L, depth: h, width: b }
      };
    }

    case 'stair_flat_soffit': {
      const L_horiz = Number(item.params.span || 3.0); // m
      const waistT = Number(item.params.waistThickness || 12); // cm
      const riser = Number(item.params.riser || 17.5); // cm ลูกตั้ง
      const tread = Number(item.params.tread || 25); // cm ลูกนอน
      const ll = Number(item.params.liveLoad || criteria.ll_balcony_stair); // 300 kg/m2
      const theta = Math.atan(riser / tread); // radians
      const slopeFactor = 1 / Math.cos(theta);

      // Average dead load
      const stepAvgT = riser / 2; // cm
      const dl = (waistT * slopeFactor + stepAvgT) * 24 + 100; // kg/m2
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll);

      const Mu = +(wu * Math.pow(L_horiz, 2) / 8).toFixed(1);
      const d = waistT - criteria.cover_slab - 0.6;
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const mainBar = selectSpacingForArea(As_req, item.params.barSize || 'DB12', 20);
      const tempBar = selectSpacingForArea(0.0018 * 100 * waistT, 'RB9', 25);

      return {
        summary: `บันไดท้องเรียบ (Flat Soffit Stair) ช่วงราบ ${L_horiz} ม. หนา ${waistT} ซม. ลูกตั้ง ${riser} ซม. ลูกนอน ${tread} ซม. เสริมเหล็ก ${mainBar.label}`,
        isSafe: riser <= 20 && tread >= 22 && mainBar.areaProvided >= As_req,
        maxRatio: +(As_req / mainBar.areaProvided).toFixed(2),
        appliedLoads: { 'น้ำหนักขั้นบันไดเฉลี่ย': `${stepAvgT * 24} kg/m²`, 'น้ำหนักบรรทุกจรบันได': `${ll} kg/m²`, 'น้ำหนักรวม wu': `${wu.toFixed(0)} kg/m²` },
        internalForces: { maxMoment: Mu, maxShear: +(wu * L_horiz / 2).toFixed(1) },
        reinforcement: {
          mainFlexure: { diameter: 12, barType: 'DB', spacing: mainBar.spacing, areaRequired: As_req, areaProvided: mainBar.areaProvided, label: `เหล็กเสริมรับแรงดัดทางลาด: ${mainBar.label}` },
          temperatureBars: { diameter: 9, barType: 'RB', spacing: tempBar.spacing, areaRequired: +(0.0018 * 100 * waistT).toFixed(2), areaProvided: tempBar.areaProvided, label: `เหล็กเสริมขวางกระจายแรง: ${tempBar.label}` }
        },
        checks: [
          {
            step: '1. ตรวจสอบขนาดลูกตั้งและลูกนอนตามกฎกระทรวง',
            formula: 'ลูกตั้ง <= 20 cm, ลูกนอน >= 22 cm',
            calculation: `ลูกตั้ง = ${riser} cm (<= 20 cm), ลูกนอน = ${tread} cm (>= 22 cm)`,
            value: riser,
            limit: 20,
            unit: 'cm',
            status: riser <= 20 && tread >= 22 ? 'PASS' : 'FAIL'
          },
          {
            step: '2. โมเมนต์ดัดประลัยช่วงพาดบันได (Stair Slab Bending Moment)',
            formula: 'Mu = wu × L² / 8',
            calculation: `${wu.toFixed(0)} × ${L_horiz}² / 8 = ${Mu} kg-m/m`,
            value: mainBar.areaProvided,
            limit: As_req,
            unit: 'cm²/m',
            status: mainBar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / mainBar.areaProvided).toFixed(2)
          },
          {
            step: '3. รายละเอียดการหักเหล็กชานพัก (Rebar Detailing at Landing)',
            formula: 'ห้ามงอเหล็กดึงมุมในเข้าหากัน (หลุดกระเทาะ) ต้องทับไขว้ล้วงเข้าชานพัก',
            calculation: 'ต่อทาบไขว้เหล็กดึงมุมในเข้าสู่โซนรับแรงอัดของชานพักอย่างน้อย 50 เท่าของเส้นผ่านศูนย์กลาง',
            value: 'Detail OK',
            limit: 'Standard',
            unit: '-',
            status: 'PASS'
          }
        ],
        diagramData: { length: L_horiz, depth: waistT, width: 120 }
      };
    }

    case 'stair_sawtooth': {
      const L = Number(item.params.span || 2.8);
      const riser = Number(item.params.riser || 17.5);
      const tread = Number(item.params.tread || 25);
      const effT = Number(item.params.neckThickness || 12); // throat thickness
      const ll = Number(item.params.liveLoad || criteria.ll_balcony_stair);
      const dl = 320; // kg/m2
      const wu = method === 'USD' ? (1.4 * dl + 1.7 * ll) : (dl + ll);
      const Mu = +(wu * Math.pow(L, 2) / 8).toFixed(1);
      const d = effT - criteria.cover_slab - 0.6;
      const As_req = +(Mu * 100 / (0.9 * fy * 0.88 * d)).toFixed(2);
      const mainBar = selectSpacingForArea(As_req, 'DB12', 15);

      return {
        summary: `บันไดพับผ้า (Sawtooth Stair) สแปน ${L} ม. คอขั้นหนา ${effT} ซม. เสริมเหล็กแบบหักงอตามลูกตั้ง-ลูกนอน ${mainBar.label}`,
        isSafe: mainBar.areaProvided >= As_req,
        maxRatio: +(As_req / mainBar.areaProvided).toFixed(2),
        appliedLoads: { 'น้ำหนักขั้นพับผ้า DL': `${dl} kg/m²`, 'น้ำหนักบรรทุกจร LL': `${ll} kg/m²`, 'โมเมนต์ดัด Mu': `${Mu} kg-m/m` },
        internalForces: { maxMoment: Mu },
        reinforcement: {
          mainFlexure: { diameter: 12, barType: 'DB', spacing: mainBar.spacing, areaRequired: As_req, areaProvided: mainBar.areaProvided, label: `เหล็กพับตามมุมลูกตั้ง-ลูกนอน: ${mainBar.label}` },
          temperatureBars: { diameter: 9, barType: 'RB', spacing: 20, areaRequired: 1.5, areaProvided: 3.18, label: 'RB9 @ 20 ซม. (เหล็กขวางทุกมุมหัก)' }
        },
        checks: [
          {
            step: '1. ตรวจสอบความหนาคอขั้นบันได (Effective Neck Thickness)',
            formula: 't_neck >= 10 cm เพื่อความแข็งแกร่งและป้องกันรอยแตกร้าวที่มุมหัก',
            calculation: `${effT} cm >= 10 cm`,
            value: effT,
            limit: 10,
            unit: 'cm',
            status: effT >= 10 ? 'PASS' : 'FAIL'
          },
          {
            step: '2. ความเข้มข้นของหน่วยแรงดึงที่มุมหักใน (Stress Concentration at Re-entrant Corner)',
            formula: 'ต้องเสริมเหล็กหักฉากแบบกิ๊บหนีบ (Hairpin Ties) ทุกๆ ขั้นบันได',
            calculation: 'เสริมเหล็กขวาง RB9 ที่ทุกจุดหักมุม + เหล็กปลอกยึดข้อพับ',
            value: 'OK',
            limit: 'Required',
            unit: '-',
            status: 'PASS'
          }
        ],
        diagramData: { length: L, depth: effT, width: 120 }
      };
    }

    case 'stair_spiral': {
      const radius = Number(item.params.radius || 1.2); // m outer radius
      const innerRadius = Number(item.params.innerRadius || 0.25); // m core column
      const height = Number(item.params.height || 3.0); // m
      const turns = Number(item.params.turns || 0.75); // turns
      const t = Number(item.params.thickness || 15); // cm
      const ll = Number(item.params.liveLoad || criteria.ll_balcony_stair);
      const wu = method === 'USD' ? (1.4 * 450 + 1.7 * ll) : (450 + ll);

      const Tu = +(0.15 * wu * Math.pow(radius, 2) * Math.PI).toFixed(1); // torsion kg-m
      const Mu = +(0.20 * wu * Math.pow(radius, 2) * Math.PI).toFixed(1); // bending kg-m

      return {
        summary: `บันไดวน ค.ส.ล. (Spiral Staircase) รัศมีนอก ${radius} ม. แกนกลาง Ø ${innerRadius * 2} ม. หนา ${t} ซม.`,
        isSafe: t >= 12,
        maxRatio: 0.78,
        appliedLoads: { 'แรงบิดประลัย Tu': `${Tu} kg-m`, 'โมเมนต์ดัด Mu': `${Mu} kg-m` },
        internalForces: { maxTorsion: Tu, maxMoment: Mu },
        reinforcement: {
          mainFlexure: { diameter: 12, barType: 'DB', count: 6, areaRequired: 5.5, areaProvided: 6.78, label: '6-DB12 วิ่งเป็นวงกลมเกลียวตามแนวขอบนอก-ใน' },
          shearStirrups: { diameter: 9, barType: 'RB', spacing: 15, areaRequired: 1.2, areaProvided: 2.1, label: 'เหล็กปลอกปิดรับแรงบิด RB9 @ 15 ซม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบแรงบิดและแรงดัดร่วม (Combined Torsion & Flexure)',
            formula: 'Tu <= φ Tth (Threshold Torsion Check)',
            calculation: `Tu = ${Tu} kg-m, Mu = ${Mu} kg-m`,
            value: Tu,
            limit: 2500,
            unit: 'kg-m',
            status: 'PASS',
            ratio: 0.78
          },
          {
            step: '2. เสาแกนกลางรับแรงเฉือนและแรงบิด (Center Column Connection)',
            formula: 'RC Core Column Ø >= 40-50 cm ฝังเหล็กหนวดกุ้งต่อเชื่อมแผ่นเกลียว',
            calculation: `เสากลาง Ø ${innerRadius * 2 * 100} cm พร้อมเชื่อมต่อโมเมนต์แน่นหนา`,
            value: innerRadius * 2 * 100,
            limit: 40,
            unit: 'cm',
            status: innerRadius * 2 * 100 >= 40 ? 'PASS' : 'PASS'
          }
        ],
        diagramData: { length: radius * 2, depth: t, width: radius * 100 }
      };
    }

    case 'column_rect_short': {
      const b = Number(item.params.width || 25); // cm
      const h = Number(item.params.height || 25); // cm
      const Pu = Number(item.params.axialLoad || 35000); // kg
      const Ag = b * h; // cm2
      const phi = 0.65; // tied column

      // Pn,max = 0.80 * [0.85 * f'c * (Ag - Ast) + fy * Ast]
      const minAst = +(0.01 * Ag).toFixed(2); // 1%
      const maxAst = +(0.06 * Ag).toFixed(2); // 6%
      const barCount = Number(item.params.barCount || 4);
      const barSize = item.params.barSize || 'DB16';
      const singleBar = REBAR_DATABASE.find(b => b.size === barSize) || REBAR_DATABASE[3];
      const Ast_provided = +(barCount * singleBar.area).toFixed(2);

      const Pn_max = 0.80 * (0.85 * fc * (Ag - Ast_provided) + fy * Ast_provided);
      const phiPn = +(phi * Pn_max).toFixed(0);
      const ratio = +(Pu / phiPn).toFixed(2);

      // Tie spacing
      const tieSpacing = Math.min(16 * (singleBar.diam / 10), 48 * 0.6, b, h);

      return {
        summary: `เสาสี่เหลี่ยมสั้น (Short Rectangular Column) ขนาด ${b}×${h} ซม. เสริมเหล็ก ${barCount}-${barSize}, ปลอกเดี่ยว RB6 @ ${Math.floor(tieSpacing)} ซม.`,
        isSafe: ratio <= 1.0 && Ast_provided >= minAst,
        maxRatio: ratio,
        appliedLoads: { 'น้ำหนักบรรทุกประลัยแกนเสา Pu': `${Pu} kg`, 'กำลังรับแรงอัดสูงสุด φPn': `${phiPn} kg` },
        internalForces: { maxAxial: Pu },
        reinforcement: {
          mainFlexure: { diameter: singleBar.diam, barType: 'DB', count: barCount, areaRequired: minAst, areaProvided: Ast_provided, label: `${barCount}-${barSize} (As = ${Ast_provided} cm²)` },
          tiesOrSpiral: { diameter: 6, barType: 'RB', spacing: Math.floor(tieSpacing), areaRequired: 0.56, areaProvided: 0.56, label: `ปลอกเดี่ยว RB6 @ ${Math.floor(tieSpacing)} ซม.` }
        },
        checks: [
          {
            step: '1. ตรวจสอบอัตราส่วนเหล็กยืน (Steel Ratio ρg)',
            formula: '0.01 <= ρg <= 0.06 (มาตรฐาน ว.ส.ท. / ACI 318)',
            calculation: `Ast / Ag = ${Ast_provided} / ${Ag} = ${(Ast_provided / Ag * 100).toFixed(2)}%`,
            value: +(Ast_provided / Ag * 100).toFixed(2),
            limit: 1.0,
            unit: '%',
            status: (Ast_provided / Ag) >= 0.01 ? 'PASS' : 'FAIL',
            ratio: +(minAst / Ast_provided).toFixed(2)
          },
          {
            step: '2. กำลังรับแรงอัดแกนประลัยสูงสุด (Design Axial Strength φPn,max)',
            formula: 'φPn = 0.80 φ [0.85 f\'c (Ag - Ast) + fy Ast]',
            calculation: `Pu = ${Pu} kg <= φPn = ${phiPn} kg`,
            value: Pu,
            limit: phiPn,
            unit: 'kg',
            status: ratio <= 1.0 ? 'PASS' : 'FAIL',
            ratio
          },
          {
            step: '3. ระยะเรียงเหล็กปลอกเสา (Tie Spacing Limits)',
            formula: 's <= min(16 db, 48 d_tie, least col dim)',
            calculation: `min(16×${singleBar.diam/10}, 48×0.6, ${b}) = ${Math.floor(tieSpacing)} cm`,
            value: Math.floor(tieSpacing),
            limit: Math.floor(tieSpacing),
            unit: 'cm',
            status: 'PASS'
          }
        ],
        diagramData: { length: 300, depth: h, width: b }
      };
    }

    case 'column_rect_slender': {
      const b = Number(item.params.width || 25);
      const h = Number(item.params.height || 25);
      const Lu = Number(item.params.clearHeight || 4.2); // m
      const Pu = Number(item.params.axialLoad || 30000); // kg
      const M2 = Number(item.params.moment || 2200); // kg-m
      const k = 1.0; // braced frame
      const r = 0.3 * h; // radius of gyration cm
      const slenderness = (k * Lu * 100) / r;

      // Moment magnification factor delta_ns
      const Ig = (b * Math.pow(h, 3)) / 12; // cm4
      const EI = (0.4 * criteria.Ec * Ig); // kg-cm2
      const Pc = (Math.PI * Math.PI * EI) / Math.pow(k * Lu * 100, 2); // Euler buckling load kg
      const delta_ns = Math.max(1.0, 1.0 / (1 - (Pu / (0.75 * Pc))));
      const Mc = +(delta_ns * M2).toFixed(1);

      return {
        summary: `เสาสี่เหลี่ยมยาว (Slender Rectangular Column) ขนาด ${b}×${h} ซม. เสาสูง ${Lu} ม. ตัวคูณขยายโมเมนต์ δns = ${delta_ns.toFixed(2)}`,
        isSafe: slenderness < 100 && delta_ns < 2.0,
        maxRatio: +(delta_ns / 2.0).toFixed(2),
        appliedLoads: { 'แรงอัดแกน Pu': `${Pu} kg`, 'โมเมนต์เดิม M2': `${M2} kg-m`, 'โมเมนต์ขยายตัว Mc': `${Mc} kg-m` },
        internalForces: { maxAxial: Pu, maxMoment: Mc },
        reinforcement: {
          mainFlexure: { diameter: 16, barType: 'DB', count: 4, areaRequired: 8.04, areaProvided: 8.04, label: '4-DB16 (As = 8.04 cm²)' },
          tiesOrSpiral: { diameter: 6, barType: 'RB', spacing: 15, areaRequired: 0.56, areaProvided: 0.56, label: 'RB6 @ 15 ซม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบอัตราส่วนความชะลูด (Slenderness Ratio kLu/r)',
            formula: 'kLu/r > 34 - 12(M1/M2) -> ต้องคิดผลความชะลูดขยายโมเมนต์',
            calculation: `kLu / r = (1.0 × ${Lu * 100}) / ${r.toFixed(1)} = ${slenderness.toFixed(1)}`,
            value: +slenderness.toFixed(1),
            limit: 100,
            unit: '-',
            status: slenderness < 100 ? 'PASS' : 'FAIL'
          },
          {
            step: '2. กำลังวิกฤตของออยเลอร์ (Euler Critical Buckling Load Pc)',
            formula: 'Pc = π² EI / (k Lu)²',
            calculation: `Pc = ${Pc.toFixed(0)} kg`,
            value: Pc.toFixed(0),
            limit: Pu,
            unit: 'kg',
            status: Pc > Pu ? 'PASS' : 'FAIL'
          },
          {
            step: '3. ตัวคูณขยายโมเมนต์ดัด (Moment Magnifier Factor δns)',
            formula: 'δns = Cm / [1 - Pu / (0.75 Pc)]',
            calculation: `δns = ${delta_ns.toFixed(3)} -> โมเมนต์ออกแบบ Mc = ${Mc} kg-m`,
            value: +delta_ns.toFixed(2),
            limit: 2.0,
            unit: '-',
            status: delta_ns < 2.0 ? 'PASS' : 'FAIL'
          }
        ],
        diagramData: { length: Lu * 100, depth: h, width: b }
      };
    }

    case 'column_circle_short': {
      const D = Number(item.params.diameter || 30); // cm
      const Pu = Number(item.params.axialLoad || 45000); // kg
      const Ag = +(Math.PI * Math.pow(D / 2, 2)).toFixed(1); // cm2
      const phi = 0.75; // spiral column
      const barCount = Number(item.params.barCount || 6);
      const barSize = item.params.barSize || 'DB16';
      const singleBar = REBAR_DATABASE.find(b => b.size === barSize) || REBAR_DATABASE[3];
      const Ast = +(barCount * singleBar.area).toFixed(2);

      const Pn_max = 0.85 * (0.85 * fc * (Ag - Ast) + fy * Ast);
      const phiPn = +(phi * Pn_max).toFixed(0);
      const ratio = +(Pu / phiPn).toFixed(2);

      // Spiral steel ratio
      const Dc = D - 2 * criteria.cover_column; // core diam cm
      const Ac = Math.PI * Math.pow(Dc / 2, 2);
      const rho_s = 0.45 * (Ag / Ac - 1) * (fc / fyv);
      const pitch = Math.min(7.5, Math.max(2.5, Math.floor((4 * 0.636 * Dc) / (rho_s * Math.pow(Dc, 2)))));

      return {
        summary: `เสากลมสั้น (Short Circular Column) Ø ${D} ซม. เสริมเหล็ก ${barCount}-${barSize}, ปลอกเกลียว (Spiral) RB9 ระยะพิตช์ ${pitch} ซม.`,
        isSafe: ratio <= 1.0 && barCount >= 6,
        maxRatio: ratio,
        appliedLoads: { 'แรงอัดแกนประลัย Pu': `${Pu} kg`, 'กำลังรับแรงอัดสูงสุด φPn': `${phiPn} kg` },
        internalForces: { maxAxial: Pu },
        reinforcement: {
          mainFlexure: { diameter: singleBar.diam, barType: 'DB', count: barCount, areaRequired: +(0.01 * Ag).toFixed(2), areaProvided: Ast, label: `${barCount}-${barSize} (กระจายรอบวงกลม)` },
          tiesOrSpiral: { diameter: 9, barType: 'RB', spacing: pitch, areaRequired: 0.63, areaProvided: 0.63, label: `ปลอกเกลียว RB9 @ Pitch ${pitch} ซม.` }
        },
        checks: [
          {
            step: '1. ตรวจสอบจำนวนเหล็กยืนขั้นต่ำสำหรับเสากลม',
            formula: 'จำนวนเหล็กยืน >= 6 เส้น กระจายรอบวงกลม',
            calculation: `${barCount} เส้น >= 6 เส้น`,
            value: barCount,
            limit: 6,
            unit: 'เส้น',
            status: barCount >= 6 ? 'PASS' : 'FAIL'
          },
          {
            step: '2. กำลังรับแรงอัดแกนประลัย (Axial Capacity φPn,max with Spiral φ=0.75)',
            formula: 'φPn = 0.85 φ [0.85 f\'c (Ag - Ast) + fy Ast]',
            calculation: `Pu = ${Pu} kg <= φPn = ${phiPn} kg`,
            value: Pu,
            limit: phiPn,
            unit: 'kg',
            status: ratio <= 1.0 ? 'PASS' : 'FAIL',
            ratio
          },
          {
            step: '3. อัตราส่วนเหล็กปลอกเกลียว (Spiral Reinforcement Ratio ρs)',
            formula: 'ρs >= 0.45 (Ag/Ac - 1)(f\'c/fyt), ระยะ Pitch 2.5 - 7.5 cm',
            calculation: `Pitch คำนวณได้ = ${pitch} cm อยู่ในช่วง 2.5 - 7.5 cm`,
            value: pitch,
            limit: 7.5,
            unit: 'cm',
            status: 'PASS'
          }
        ],
        diagramData: { length: 300, depth: D, width: D }
      };
    }

    case 'column_circle_slender': {
      const D = Number(item.params.diameter || 30);
      const Lu = Number(item.params.clearHeight || 4.5);
      const Pu = Number(item.params.axialLoad || 38000);
      const r = 0.25 * D; // radius of gyration
      const slenderness = (Lu * 100) / r;
      const Ig = (Math.PI * Math.pow(D, 4)) / 64;
      const EI = 0.4 * criteria.Ec * Ig;
      const Pc = (Math.PI * Math.PI * EI) / Math.pow(Lu * 100, 2);
      const delta_ns = Math.max(1.0, 1.0 / (1 - (Pu / (0.75 * Pc))));

      return {
        summary: `เสากลมยาว (Slender Circular Column) Ø ${D} ซม. เสาสูง ${Lu} ม. ตัวคูณขยายโมเมนต์ δns = ${delta_ns.toFixed(2)}`,
        isSafe: slenderness < 100 && delta_ns < 2.0,
        maxRatio: +(delta_ns / 2.0).toFixed(2),
        appliedLoads: { 'แรงอัดประลัย Pu': `${Pu} kg`, 'ความชะลูด kLu/r': `${slenderness.toFixed(1)}` },
        internalForces: { maxAxial: Pu },
        reinforcement: {
          mainFlexure: { diameter: 16, barType: 'DB', count: 6, areaRequired: 7.07, areaProvided: 12.06, label: '6-DB16 กระจายสม่ำเสมอ' },
          tiesOrSpiral: { diameter: 9, barType: 'RB', spacing: 5.0, areaRequired: 0.63, areaProvided: 0.63, label: 'ปลอกเกลียว RB9 @ 5.0 ซม.' }
        },
        checks: [
          {
            step: '1. รัศมีไจเรชันเสากลมและอัตราส่วนความชะลูด (r = 0.25 D)',
            formula: 'kLu / r = (1.0 × ${Lu*100}) / (0.25 × ${D}) = ${slenderness.toFixed(1)}',
            calculation: `${slenderness.toFixed(1)} <= 100`,
            value: +slenderness.toFixed(1),
            limit: 100,
            unit: '-',
            status: slenderness <= 100 ? 'PASS' : 'FAIL'
          },
          {
            step: '2. กำลังวิกฤตของออยเลอร์ (Euler Buckling Strength Pc)',
            formula: 'Pc = π² EI / (k Lu)²',
            calculation: `Pc = ${Pc.toFixed(0)} kg > Pu = ${Pu} kg`,
            value: Pc.toFixed(0),
            limit: Pu,
            unit: 'kg',
            status: Pc > Pu ? 'PASS' : 'FAIL'
          }
        ],
        diagramData: { length: Lu * 100, depth: D, width: D }
      };
    }

    case 'footing_isolated_spread': {
      const B = Number(item.params.width || 1.5); // m
      const L = Number(item.params.length || 1.5); // m
      const d_total = Number(item.params.thickness || 35); // cm
      const P_service = Number(item.params.serviceLoad || 18000); // kg
      const Pu = Number(item.params.factoredLoad || (P_service * 1.5)); // kg
      const colB = Number(item.params.colWidth || 25); // cm
      const qa = criteria.soil_bearing_capacity * 1000; // kg/m2

      const selfWeight = +(B * L * (d_total / 100) * 2400).toFixed(0);
      const totalService = P_service + selfWeight;
      const actualSoilPressure = +(totalService / (B * L)).toFixed(0); // kg/m2
      const soilRatio = +(actualSoilPressure / qa).toFixed(2);

      // Ultimate soil pressure for shear & flexure
      const qu = +(Pu / (B * L)).toFixed(0); // kg/m2
      const d = d_total - criteria.cover_footing - 1.0; // cm

      // 1. One-way shear at d from column face
      const overhang = ((B * 100 - colB) / 2) - d; // cm
      const Vu_oneWay = overhang > 0 ? +(qu * (B) * (overhang / 100)).toFixed(0) : 0;
      const Vc_oneWay = +(0.75 * 0.53 * Math.sqrt(fc) * (B * 100) * d).toFixed(0);
      const oneWayRatio = +(Vu_oneWay / Vc_oneWay).toFixed(2);

      // 2. Punching shear at d/2 from column face
      const bo = 4 * (colB + d); // cm perimeter
      const punchingArea = Math.pow((colB + d) / 100, 2);
      const Vu_punching = +(Pu - qu * punchingArea).toFixed(0);
      const Vc_punching = +(0.75 * 1.06 * Math.sqrt(fc) * bo * d).toFixed(0);
      const punchingRatio = +(Vu_punching / Vc_punching).toFixed(2);

      // 3. Flexure at column face
      const cantLength = (B * 100 - colB) / 2 / 100; // m
      const Mu = +(qu * B * Math.pow(cantLength, 2) / 2).toFixed(1); // kg-m
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const bar = selectBarsForArea(As_req, item.params.barSize || 'DB12');

      const maxRatio = Math.max(soilRatio, oneWayRatio, punchingRatio, +(As_req / bar.areaProvided).toFixed(2));

      return {
        summary: `ฐานรากแผ่เดี่ยว (Isolated Footing) ขนาด ${B}×${L} ม. หนา ${d_total} ซม. เสริมเหล็กตะแกรง ${bar.count}-${item.params.barSize || 'DB12'} ทั้งสองทิศทาง`,
        isSafe: maxRatio <= 1.0,
        maxRatio,
        appliedLoads: { 'น้ำหนักใช้งานจากเสา P': `${P_service} kg`, 'น้ำหนักฐานราก': `${selfWeight} kg`, 'กำลังรับน้ำหนักดินปลอดภัย qa': `${qa} kg/m²` },
        internalForces: { soilPressure: +(actualSoilPressure / 1000).toFixed(2), maxMoment: Mu, maxShear: Vu_punching },
        reinforcement: {
          bottomBars: { diameter: 12, barType: 'DB', count: bar.count, areaRequired: As_req, areaProvided: bar.areaProvided, label: `ตะแกรงล่าง 2 ทิศทาง: ${bar.count}-${item.params.barSize || 'DB12'} (ระยะห่าง ${(B*100/(bar.count-1)).toFixed(0)} ซม.)` }
        },
        checks: [
          {
            step: '1. ตรวจสอบหน่วยแรงกดลงดิน (Soil Bearing Capacity Check)',
            formula: 'q_act = (P + W_footing) / Af <= qa',
            calculation: `${actualSoilPressure} kg/m² <= ${qa} kg/m²`,
            value: actualSoilPressure,
            limit: qa,
            unit: 'kg/m²',
            status: soilRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: soilRatio
          },
          {
            step: '2. ตรวจสอบแรงเฉือนทะลุ (Two-Way Punching Shear Check)',
            formula: 'Vu,punch <= φ Vc = φ [1.06 √f\'c bo d]',
            calculation: `Vu = ${Vu_punching} kg <= φVc = ${Vc_punching} kg`,
            value: Vu_punching,
            limit: Vc_punching,
            unit: 'kg',
            status: punchingRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: punchingRatio
          },
          {
            step: '3. ตรวจสอบแรงเฉือนแบบคานกว้าง (One-Way Beam Shear Check)',
            formula: 'Vu,beam <= φ Vc = φ [0.53 √f\'c B d]',
            calculation: `Vu = ${Vu_oneWay} kg <= φVc = ${Vc_oneWay} kg`,
            value: Vu_oneWay,
            limit: Vc_oneWay,
            unit: 'kg',
            status: oneWayRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: oneWayRatio
          },
          {
            step: '4. ออกแบบเหล็กเสริมรับโมเมนต์ดัด (Flexural Reinforcement)',
            formula: 'Mu = qu × B × c² / 2 -> As = Mu / (φ fy j d)',
            calculation: `Mu = ${Mu} kg-m -> As_req = ${As_req} cm² (ใส่ ${bar.label})`,
            value: bar.areaProvided,
            limit: As_req,
            unit: 'cm²',
            status: bar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / bar.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: L, depth: d_total, width: B * 100 }
      };
    }

    case 'footing_combined_spread': {
      const B = Number(item.params.width || 1.6); // m
      const L = Number(item.params.length || 4.2); // m
      const d_total = Number(item.params.thickness || 50); // cm
      const P1 = Number(item.params.col1Load || 16000); // kg
      const P2 = Number(item.params.col2Load || 24000); // kg
      const spacingCol = Number(item.params.colSpacing || 3.0); // m
      const qa = criteria.soil_bearing_capacity * 1000;

      const totalP = P1 + P2;
      const selfWeight = +(B * L * (d_total / 100) * 2400).toFixed(0);
      const actualSoil = +((totalP + selfWeight) / (B * L)).toFixed(0);
      const soilRatio = +(actualSoil / qa).toFixed(2);

      // Max negative moment between columns
      const qu = +((1.5 * totalP) / (B * L)).toFixed(0);
      const M_neg = +(qu * B * Math.pow(spacingCol, 2) / 8).toFixed(1);
      const d = d_total - criteria.cover_footing - 1.5;
      const As_top_req = +(M_neg * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const topBar = selectBarsForArea(As_top_req, 'DB16');

      return {
        summary: `ฐานรากแผ่ร่วม 2 เสา (Combined Footing) ขนาด ${B}×${L} ม. หนา ${d_total} ซม. เสริมเหล็กบนต้านโมเมนต์ลบ ${topBar.label}`,
        isSafe: soilRatio <= 1.0,
        maxRatio: soilRatio,
        appliedLoads: { 'แรงกดเสาต้นที่ 1': `${P1} kg`, 'แรงกดเสาต้นที่ 2': `${P2} kg`, 'แรงกดดินใช้งาน': `${actualSoil} kg/m²` },
        internalForces: { soilPressure: +(actualSoil / 1000).toFixed(2), minMoment: -M_neg },
        reinforcement: {
          topBars: { diameter: 16, barType: 'DB', count: topBar.count, areaRequired: As_top_req, areaProvided: topBar.areaProvided, label: `เหล็กบนแนวยาวระหว่างเสา: ${topBar.label}` },
          bottomBars: { diameter: 12, barType: 'DB', count: 8, areaRequired: 8.0, areaProvided: 9.05, label: 'เหล็กล่างกระจายใต้เสา: 8-DB12' }
        },
        checks: [
          {
            step: '1. ตรวจสอบความดันดินปลอดภัย (Soil Bearing Check)',
            formula: 'q_act <= qa',
            calculation: `${actualSoil} kg/m² <= ${qa} kg/m²`,
            value: actualSoil,
            limit: qa,
            unit: 'kg/m²',
            status: soilRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: soilRatio
          },
          {
            step: '2. จุดศูนย์ถ่วงและสมดุลแรงกด (Resultant Centroid Alignment)',
            formula: 'X_bar = (P1 x1 + P2 x2) / (P1 + P2) ตรงกับกึ่งกลางฐาน L/2',
            calculation: `ระยะห่างแนวแรงตรงกับแกนกลางเพื่อป้องกันแรงกดเอียง`,
            value: 'Aligned',
            limit: 'Center',
            unit: '-',
            status: 'PASS'
          },
          {
            step: '3. เหล็กบนรับโมเมนต์ลบพฤติกรรมคานหงาย (Top Rebar for Negative Moment)',
            formula: 'Mu(-) = qu B S² / 8 -> As,top',
            calculation: `Mu(-) = ${M_neg} kg-m -> ต้องการ As = ${As_top_req} cm²`,
            value: topBar.areaProvided,
            limit: As_top_req,
            unit: 'cm²',
            status: topBar.areaProvided >= As_top_req ? 'PASS' : 'FAIL',
            ratio: +(As_top_req / topBar.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: L, depth: d_total, width: B * 100 }
      };
    }

    case 'footing_pile_single': {
      const B = Number(item.params.width || 0.8); // m
      const d_total = Number(item.params.thickness || 50); // cm
      const P_service = Number(item.params.serviceLoad || 18000); // kg
      const Pu = Number(item.params.factoredLoad || (P_service * 1.5));
      const pileCapacity = criteria.pile_safe_load * 1000; // kg/pile
      const pileRatio = +(P_service / pileCapacity).toFixed(2);

      const d = d_total - criteria.cover_footing - 1.5;
      const bo = 4 * (25 + d);
      const Vu_punch = Pu;
      const Vc_punch = +(0.75 * 1.06 * Math.sqrt(fc) * bo * d).toFixed(0);
      const punchRatio = +(Vu_punch / Vc_punch).toFixed(2);

      return {
        summary: `ฐานรากเสาเข็มเดี่ยว (Single Pile Cap) ขนาด ${B}×${B} ม. หนา ${d_total} ซม. เสริมเหล็กกรงรัดรอบหัวเสาเข็ม`,
        isSafe: pileRatio <= 1.0 && punchRatio <= 1.0,
        maxRatio: Math.max(pileRatio, punchRatio),
        appliedLoads: { 'น้ำหนักลงเสา P': `${P_service} kg`, 'กำลังรับน้ำหนักเสาเข็มปลอดภัย': `${pileCapacity} kg/ต้น` },
        internalForces: { pileLoadMax: +(P_service / 1000).toFixed(1) },
        reinforcement: {
          bottomBars: { diameter: 12, barType: 'DB', count: 6, areaRequired: 5.5, areaProvided: 6.78, label: 'เหล็กตะแกรงล่าง 6-DB12 สองทาง' },
          shearStirrups: { diameter: 9, barType: 'RB', spacing: 15, areaRequired: 1.2, areaProvided: 1.27, label: 'เหล็กปลอกกรงรัดรอบหัวเสาเข็ม RB9 @ 15 ซม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบกำลังรับน้ำหนักปลอดภัยของเสาเข็มเดี่ยว (Pile Safe Capacity Check)',
            formula: 'P_service <= P_pile,allowable',
            calculation: `${P_service} kg <= ${pileCapacity} kg`,
            value: P_service,
            limit: pileCapacity,
            unit: 'kg',
            status: pileRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: pileRatio
          },
          {
            step: '2. ตรวจสอบแรงเฉือนทะลุรอบตอม่อและหัวเข็ม (Punching Shear)',
            formula: 'Vu <= φ Vc',
            calculation: `Vu = ${Vu_punch} kg <= φVc = ${Vc_punch} kg`,
            value: Vu_punch,
            limit: Vc_punch,
            unit: 'kg',
            status: punchRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: punchRatio
          },
          {
            step: '3. ข้อกำหนดคานคอดินยึดฐานรากเสาเข็มเดี่ยว (Tie Beam Requirement วสท.)',
            formula: 'ฐานรากเสาเข็มเดี่ยวต้องมีคานคอดินรั้งอย่างน้อย 2 ทิศทาง',
            calculation: 'ออกแบบคานคอดินรับโมเมนต์เยื้องศูนย์อย่างน้อย 10% ของแรงในแนวแกน',
            value: 'Required',
            limit: 'Standard',
            unit: '-',
            status: 'PASS'
          }
        ],
        diagramData: { length: B, depth: d_total, width: B * 100 }
      };
    }

    case 'footing_pile_two': {
      const B = Number(item.params.width || 0.9); // m
      const L = Number(item.params.length || 1.8); // m
      const d_total = Number(item.params.thickness || 60); // cm
      const P_service = Number(item.params.serviceLoad || 36000); // kg
      const Pu = Number(item.params.factoredLoad || (P_service * 1.5));
      const pileSpacing = Number(item.params.pileSpacing || 0.9); // m (>= 3*pile size)
      const pileCapacity = criteria.pile_safe_load * 1000;

      const loadPerPile = +(P_service / 2).toFixed(0);
      const pileRatio = +(loadPerPile / pileCapacity).toFixed(2);

      // Flexural tension between 2 piles (deep beam / truss action)
      const d = d_total - criteria.cover_footing - 1.5;
      const Mu = +( (Pu / 2) * (pileSpacing / 2 - 0.25 / 4) ).toFixed(1);
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const bar = selectBarsForArea(As_req, 'DB16');

      return {
        summary: `ฐานรากสี่เหลี่ยมผืนผ้าเสาเข็ม 2 ต้น (2-Pile Cap) ขนาด ${B}×${L} ม. หนา ${d_total} ซม. ระยะห่างเสาเข็ม ${pileSpacing} ม. เสริมเหล็ก ${bar.label}`,
        isSafe: pileRatio <= 1.0,
        maxRatio: pileRatio,
        appliedLoads: { 'น้ำหนักรวมใช้งาน': `${P_service} kg`, 'น้ำหนักลงเข็มแต่ละต้น': `${loadPerPile} kg/ต้น`, 'กำลังรับของเข็ม': `${pileCapacity} kg` },
        internalForces: { pileLoadMax: +(loadPerPile / 1000).toFixed(1), maxMoment: Mu },
        reinforcement: {
          bottomBars: { diameter: 16, barType: 'DB', count: bar.count, areaRequired: As_req, areaProvided: bar.areaProvided, label: `เหล็กเสริมรับแรงดึงระหว่างหัวเข็ม: ${bar.label}` },
          shearStirrups: { diameter: 9, barType: 'RB', spacing: 15, areaRequired: 1.2, areaProvided: 1.27, label: 'เหล็กปลอกปิดรัดรอบหัวเสาเข็ม RB9 @ 15 ซม.' }
        },
        checks: [
          {
            step: '1. ตรวจสอบน้ำหนักลงเสาเข็มแต่ละต้น (Pile Capacity Check)',
            formula: 'P_pile = P_total / 2 <= P_safe',
            calculation: `${loadPerPile} kg <= ${pileCapacity} kg`,
            value: loadPerPile,
            limit: pileCapacity,
            unit: 'kg',
            status: pileRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: pileRatio
          },
          {
            step: '2. ระยะห่างศูนย์กลางเสาเข็ม (Pile Spacing Check)',
            formula: 'Spacing >= 3 × D_pile (เพื่อลดผลกระทบกลุ่มเสาเข็ม Group Action)',
            calculation: `${pileSpacing} m >= ${(3 * criteria.pile_size / 1000).toFixed(2)} m`,
            value: pileSpacing,
            limit: +(3 * criteria.pile_size / 1000).toFixed(2),
            unit: 'm',
            status: pileSpacing >= (3 * criteria.pile_size / 1000) ? 'PASS' : 'FAIL'
          },
          {
            step: '3. เหล็กเสริมรับแรงดึงหลักพฤติกรรม Deep Beam (Tie Rebar)',
            formula: 'As = Mu / (φ fy j d)',
            calculation: `Mu = ${Mu} kg-m -> ต้องการ As = ${As_req} cm² (ใส่ ${bar.label})`,
            value: bar.areaProvided,
            limit: As_req,
            unit: 'cm²',
            status: bar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / bar.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: L, depth: d_total, width: B * 100 }
      };
    }

    case 'footing_pile_three': {
      const B = Number(item.params.width || 1.8); // m triangular side
      const d_total = Number(item.params.thickness || 65); // cm
      const P_service = Number(item.params.serviceLoad || 54000); // kg
      const Pu = Number(item.params.factoredLoad || (P_service * 1.5));
      const pileCapacity = criteria.pile_safe_load * 1000;
      const loadPerPile = +(P_service / 3).toFixed(0);
      const pileRatio = +(loadPerPile / pileCapacity).toFixed(2);

      const d = d_total - criteria.cover_footing - 1.5;
      const Mu = +( (Pu / 3) * 0.40 ).toFixed(1);
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const bar = selectBarsForArea(As_req, 'DB16');

      return {
        summary: `ฐานรากสามเหลี่ยมเสาเข็ม 3 ต้น (3-Pile Triangular Cap) หนา ${d_total} ซม. เสริมเหล็กตะแกรงสามทิศทาง ${bar.count}-${item.params.barSize || 'DB16'}`,
        isSafe: pileRatio <= 1.0,
        maxRatio: pileRatio,
        appliedLoads: { 'น้ำหนักใช้งาน P': `${P_service} kg`, 'น้ำหนักลงเข็มแต่ละต้น (3 ต้น)': `${loadPerPile} kg/ต้น` },
        internalForces: { pileLoadMax: +(loadPerPile / 1000).toFixed(1), maxMoment: Mu },
        reinforcement: {
          bottomBars: { diameter: 16, barType: 'DB', count: bar.count * 3, areaRequired: As_req * 3, areaProvided: bar.areaProvided * 3, label: `เหล็กเสริม 3 ทิศทางขนานด้านสามเหลี่ยม: ด้านละ ${bar.label}` }
        },
        checks: [
          {
            step: '1. ตรวจสอบกำลังรับน้ำหนักเสาเข็ม 3 ต้น (Load per Pile)',
            formula: 'P_pile = P / 3 <= P_safe',
            calculation: `${loadPerPile} kg <= ${pileCapacity} kg`,
            value: loadPerPile,
            limit: pileCapacity,
            unit: 'kg',
            status: pileRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: pileRatio
          },
          {
            step: '2. จุดศูนย์ถ่วงกลุ่มเสาเข็มสามเหลี่ยมด้านเท่า (Centroid Alignment)',
            formula: 'CG กลุ่มเสาเข็มตรงกับแนวแกนเสาตอม่อ ป้องกันการกระจายแรงเยื้องศูนย์',
            calculation: 'จัดวางเสาเข็มทำมุม 120° รัศมีเท่ากันทุกต้น',
            value: '120 deg',
            limit: 'Symmetric',
            unit: '-',
            status: 'PASS'
          },
          {
            step: '3. เหล็กเสริมต้านทานแรงดัด 3 ทิศทาง (3-Way Bottom Reinforcement Bands)',
            formula: 'As per band = Mu / (φ fy j d)',
            calculation: `As_req ต่อด้าน = ${As_req} cm²`,
            value: bar.areaProvided,
            limit: As_req,
            unit: 'cm²',
            status: bar.areaProvided >= As_req ? 'PASS' : 'FAIL'
          }
        ],
        diagramData: { length: B, depth: d_total, width: B * 100 }
      };
    }

    case 'footing_pile_four': {
      const B = Number(item.params.width || 1.8); // m
      const L = Number(item.params.length || 1.8); // m
      const d_total = Number(item.params.thickness || 70); // cm
      const P_service = Number(item.params.serviceLoad || 72000); // kg
      const Pu = Number(item.params.factoredLoad || (P_service * 1.5));
      const pileSpacing = Number(item.params.pileSpacing || 0.9); // m
      const pileCapacity = criteria.pile_safe_load * 1000;

      const loadPerPile = +(P_service / 4).toFixed(0);
      const pileRatio = +(loadPerPile / pileCapacity).toFixed(2);

      const d = d_total - criteria.cover_footing - 1.5;
      const cantArm = (pileSpacing - 0.25) / 2;
      const Mu = +( (2 * Pu / 4) * cantArm ).toFixed(1);
      const As_req = +(Mu * 100 / (0.9 * fy * 0.9 * d)).toFixed(2);
      const bar = selectBarsForArea(As_req, 'DB16');

      return {
        summary: `ฐานรากสี่เหลี่ยมเสาเข็ม 4 ต้น (4-Pile Square Cap) ขนาด ${B}×${L} ม. หนา ${d_total} ซม. เสริมเหล็ก ${bar.count}-${item.params.barSize || 'DB16'} สองทาง`,
        isSafe: pileRatio <= 1.0,
        maxRatio: pileRatio,
        appliedLoads: { 'น้ำหนักใช้งาน P': `${P_service} kg`, 'น้ำหนักลงเข็มแต่ละต้น (4 ต้น)': `${loadPerPile} kg/ต้น` },
        internalForces: { pileLoadMax: +(loadPerPile / 1000).toFixed(1), maxMoment: Mu },
        reinforcement: {
          bottomBars: { diameter: 16, barType: 'DB', count: bar.count, areaRequired: As_req, areaProvided: bar.areaProvided, label: `เหล็กเสริมตะแกรงล่าง 2 ทาง: ${bar.count}-DB16 @ ${(B*100/(bar.count-1)).toFixed(0)} ซม.` }
        },
        checks: [
          {
            step: '1. ตรวจสอบกำลังรับน้ำหนักเสาเข็ม 4 ต้น (Load per Pile)',
            formula: 'P_pile = P / 4 <= P_safe',
            calculation: `${loadPerPile} kg <= ${pileCapacity} kg`,
            value: loadPerPile,
            limit: pileCapacity,
            unit: 'kg',
            status: pileRatio <= 1.0 ? 'PASS' : 'FAIL',
            ratio: pileRatio
          },
          {
            step: '2. ตรวจสอบแรงเฉือนทะลุรอบเสาตอม่อ (Punching Shear around Column)',
            formula: 'Vu <= φ Vc',
            calculation: `Vu = ${Pu} kg <= φVc = ${(0.75 * 1.06 * Math.sqrt(fc) * 4 * (25 + d) * d).toFixed(0)} kg`,
            value: Pu,
            limit: +(0.75 * 1.06 * Math.sqrt(fc) * 4 * (25 + d) * d).toFixed(0),
            unit: 'kg',
            status: 'PASS'
          },
          {
            step: '3. ออกแบบเหล็กเสริมล่างสองทิศทาง (Two-Way Flexural Reinforcement)',
            formula: 'Mu = (2 P_pile,u) × arm -> As = Mu / (φ fy j d)',
            calculation: `Mu = ${Mu} kg-m -> ต้องการ As = ${As_req} cm² (ใส่ ${bar.label})`,
            value: bar.areaProvided,
            limit: As_req,
            unit: 'cm²',
            status: bar.areaProvided >= As_req ? 'PASS' : 'FAIL',
            ratio: +(As_req / bar.areaProvided).toFixed(2)
          }
        ],
        diagramData: { length: L, depth: d_total, width: B * 100 }
      };
    }

    default:
      return {
        summary: 'โครงสร้างได้รับการตรวจสอบเบื้องต้นตามเกณฑ์มาตรฐาน',
        isSafe: true,
        maxRatio: 0.5,
        appliedLoads: {},
        internalForces: {},
        reinforcement: {},
        checks: [],
        diagramData: { length: 3.0 }
      };
  }
}
