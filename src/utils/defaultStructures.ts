import { StructuralMemberData } from '../types/structure';

export const INITIAL_MEMBERS: StructuralMemberData[] = [
  // SLABS
  {
    id: 'sog-1',
    tag: 'GS-1',
    name: 'พื้นวางบนดิน (Slab on Ground)',
    category: 'slab',
    type: 'slab_on_ground',
    description: 'พื้นลานจอดรถและพื้นชั้นล่างวางบนดินบดอัดแน่น',
    method: 'USD',
    params: {
      thickness: 15, // cm
      subgradeReaction: 5.0, // kg/cm3
      liveLoad: 500, // kg/m2
      pointLoad: 1500, // kg
      jointSpacing: 4.0, // m
      wiremesh: 'Wiremesh ø6 mm @ 0.20 ม.'
    }
  },
  {
    id: 's2w-1',
    tag: 'S-1',
    name: 'พื้นสองทาง (Two-Way Slab)',
    category: 'slab',
    type: 'slab_two_way',
    description: 'พื้นห้องโถง-ห้องนอน ขอบรองรับคานทั้ง 4 ด้าน',
    method: 'USD',
    params: {
      shortSpan: 3.5, // m
      longSpan: 4.5, // m
      thickness: 12, // cm
      liveLoad: 150, // kg/m2
      barSize: 'DB10'
    }
  },
  {
    id: 's1w-1',
    tag: 'S-2',
    name: 'พื้นทางเดียว (One-Way Slab)',
    category: 'slab',
    type: 'slab_one_way',
    description: 'พื้นระเบียงทางเดินหรือพื้นสแปนแคบยาว L/S > 2',
    method: 'USD',
    params: {
      span: 2.2, // m
      thickness: 10, // cm
      liveLoad: 300, // kg/m2
      barSize: 'DB10'
    }
  },
  {
    id: 'spp-1',
    tag: 'PS-1',
    name: 'พื้นสำเร็จรูปท้องเรียบ (Plank Precast)',
    category: 'slab',
    type: 'slab_precast_plank',
    description: 'แผ่นพื้นคอนกรีตอัดแรงท้องเรียบ 35 ซม. เททับหน้า 5 ซม.',
    method: 'USD',
    params: {
      span: 3.5, // m
      plankThickness: 5, // cm
      toppingThickness: 5, // cm
      liveLoad: 150, // kg/m2
      wiremesh: 'Wiremesh ø4 mm @ 0.20 ม.'
    }
  },
  {
    id: 'shc-1',
    tag: 'HC-1',
    name: 'พื้นสำเร็จรูปกลวง (Hollow Core)',
    category: 'slab',
    type: 'slab_precast_hollow_core',
    description: 'แผ่นพื้นสำเร็จรูปแบบมีรูกลวงลดน้ำหนัก สำหรับสแปนยาว',
    method: 'USD',
    params: {
      span: 5.0, // m
      coreThickness: 10, // cm
      toppingThickness: 5, // cm
      liveLoad: 200 // kg/m2
    }
  },

  // BEAMS
  {
    id: 'bs-1',
    tag: 'B-1',
    name: 'คานเดี่ยว / ช่วงเดียว (Simple Beam)',
    category: 'beam',
    type: 'beam_simple',
    description: 'คานรองรับพื้นและผนังก่ออิฐ ช่วงพาดเดี่ยว',
    method: 'USD',
    params: {
      span: 4.0, // m
      width: 20, // cm
      height: 40, // cm
      deadLoad: 450, // kg/m
      liveLoad: 300, // kg/m
      barSize: 'DB16',
      stirrupSize: 'RB6'
    }
  },
  {
    id: 'bc-1',
    tag: 'B-2',
    name: 'คานต่อเนื่อง (Continuous Beam)',
    category: 'beam',
    type: 'beam_continuous',
    description: 'คานต่อเนื่องพาดผ่านเสา 2-3 ช่วง',
    method: 'USD',
    params: {
      span: 4.5, // m
      width: 20, // cm
      height: 45, // cm
      deadLoad: 500, // kg/m
      liveLoad: 350, // kg/m
      barSize: 'DB16'
    }
  },
  {
    id: 'bk-1',
    tag: 'B-3',
    name: 'คานยื่น (Cantilever Beam)',
    category: 'beam',
    type: 'beam_cantilever',
    description: 'คานยื่นรับชายคา ระเบียง หรือกันสาด',
    method: 'USD',
    params: {
      span: 1.8, // m
      width: 20, // cm
      height: 40, // cm
      deadLoad: 300, // kg/m
      liveLoad: 300, // kg/m
      pointLoad: 150, // kg
      barSize: 'DB16'
    }
  },

  // STAIRS
  {
    id: 'st-flat',
    tag: 'ST-1',
    name: 'บันไดท้องเรียบ (Flat Soffit Stair)',
    category: 'stair',
    type: 'stair_flat_soffit',
    description: 'บันไดคอนกรีตเสริมเหล็กใต้ท้องเรียบมาตรฐาน',
    method: 'USD',
    params: {
      span: 3.0, // m
      waistThickness: 12, // cm
      riser: 17.5, // cm
      tread: 25.0, // cm
      liveLoad: 300, // kg/m2
      barSize: 'DB12'
    }
  },
  {
    id: 'st-saw',
    tag: 'ST-2',
    name: 'บันไดพับผ้า (Sawtooth Stair)',
    category: 'stair',
    type: 'stair_sawtooth',
    description: 'บันไดพับผ้าโมเดิร์น ลายหยักตามขั้นลูกตั้ง-ลูกนอน',
    method: 'USD',
    params: {
      span: 2.8, // m
      neckThickness: 12, // cm
      riser: 17.5, // cm
      tread: 25.0, // cm
      liveLoad: 300 // kg/m2
    }
  },
  {
    id: 'st-spiral',
    tag: 'ST-3',
    name: 'บันไดวน (Spiral Stair)',
    category: 'stair',
    type: 'stair_spiral',
    description: 'บันไดวน ค.ส.ล. หมุนรอบเสากลมกลาง',
    method: 'USD',
    params: {
      radius: 1.2, // m
      innerRadius: 0.25, // m
      height: 3.0, // m
      turns: 0.75, // turns
      thickness: 15, // cm
      liveLoad: 300 // kg/m2
    }
  },

  // COLUMNS
  {
    id: 'col-rs',
    tag: 'C-1',
    name: 'เสาสี่เหลี่ยมสั้น (Short Rectangular Column)',
    category: 'column',
    type: 'column_rect_short',
    description: 'เสา ค.ส.ล. สี่เหลี่ยมจัตุรัสรับแรงอัดแกนเสาชั้น 1-2',
    method: 'USD',
    params: {
      width: 25, // cm
      height: 25, // cm
      axialLoad: 38000, // kg
      barCount: 4,
      barSize: 'DB16'
    }
  },
  {
    id: 'col-rl',
    tag: 'C-2',
    name: 'เสาสี่เหลี่ยมยาว (Slender Rectangular Column)',
    category: 'column',
    type: 'column_rect_slender',
    description: 'เสาชะลูดห้องโถงเพดานสูง (Double Volume) วิเคราะห์ขยายโมเมนต์',
    method: 'USD',
    params: {
      width: 25, // cm
      height: 25, // cm
      clearHeight: 4.5, // m
      axialLoad: 30000, // kg
      moment: 2500 // kg-m
    }
  },
  {
    id: 'col-cs',
    tag: 'C-3',
    name: 'เสากลมสั้น (Short Circular Column)',
    category: 'column',
    type: 'column_circle_short',
    description: 'เสากลมสถาปัตยกรรม พันเหล็กปลอกเกลียว (Spiral)',
    method: 'USD',
    params: {
      diameter: 30, // cm
      axialLoad: 48000, // kg
      barCount: 6,
      barSize: 'DB16'
    }
  },
  {
    id: 'col-cl',
    tag: 'C-4',
    name: 'เสากลมยาว (Slender Circular Column)',
    category: 'column',
    type: 'column_circle_slender',
    description: 'เสากลมโถงสูง ตรวจสอบผลการโก่งเดาะออยเลอร์',
    method: 'USD',
    params: {
      diameter: 30, // cm
      clearHeight: 4.8, // m
      axialLoad: 38000 // kg
    }
  },

  // FOOTINGS
  {
    id: 'ft-iso',
    tag: 'F-1',
    name: 'ฐานรากแผ่เดี่ยว (Isolated Spread Footing)',
    category: 'footing',
    type: 'footing_isolated_spread',
    description: 'ฐานรากแผ่วางบนชั้นดินรับน้ำหนักปลอดภัย',
    method: 'USD',
    params: {
      width: 1.5, // m
      length: 1.5, // m
      thickness: 35, // cm
      serviceLoad: 18000, // kg
      factoredLoad: 27000, // kg
      colWidth: 25, // cm
      barSize: 'DB12'
    }
  },
  {
    id: 'ft-comb',
    tag: 'F-2',
    name: 'ฐานรากแผ่ร่วม (Combined Spread Footing)',
    category: 'footing',
    type: 'footing_combined_spread',
    description: 'ฐานรากแผ่ร่วม 2 เสาชิดแนวเขตที่ดิน',
    method: 'USD',
    params: {
      width: 1.6, // m
      length: 4.2, // m
      thickness: 50, // cm
      col1Load: 16000, // kg
      col2Load: 24000, // kg
      colSpacing: 3.0 // m
    }
  },
  {
    id: 'ft-p1',
    tag: 'F-3',
    name: 'ฐานรากเสาเข็มเดี่ยว (Single Pile Cap)',
    category: 'footing',
    type: 'footing_pile_single',
    description: 'ฐานรากรองรับบนเสาเข็ม 1 ต้น พร้อมคานคอดินรั้ง',
    method: 'USD',
    params: {
      width: 0.8, // m
      thickness: 50, // cm
      serviceLoad: 18000, // kg
      factoredLoad: 27000 // kg
    }
  },
  {
    id: 'ft-p2',
    tag: 'F-4',
    name: 'ฐานรากสี่เหลี่ยมผืนผ้าเสาเข็ม 2 ต้น (2-Pile Cap)',
    category: 'footing',
    type: 'footing_pile_two',
    description: 'ฐานรากเข็มคู่ พฤติกรรมคานลึก (Deep Beam Strut-and-Tie)',
    method: 'USD',
    params: {
      width: 0.9, // m
      length: 1.8, // m
      thickness: 60, // cm
      pileSpacing: 0.9, // m
      serviceLoad: 36000, // kg
      factoredLoad: 54000 // kg
    }
  },
  {
    id: 'ft-p3',
    tag: 'F-5',
    name: 'ฐานรากสามเหลี่ยมเสาเข็ม 3 ต้น (3-Pile Cap)',
    category: 'footing',
    type: 'footing_pile_three',
    description: 'ฐานรากสามเหลี่ยมด้านเท่า เสาเข็ม 3 ต้นทำมุม 120°',
    method: 'USD',
    params: {
      width: 1.8, // m
      thickness: 65, // cm
      serviceLoad: 54000, // kg
      factoredLoad: 81000, // kg
      barSize: 'DB16'
    }
  },
  {
    id: 'ft-p4',
    tag: 'F-6',
    name: 'ฐานรากสี่เหลี่ยมเสาเข็ม 4 ต้น (4-Pile Cap)',
    category: 'footing',
    type: 'footing_pile_four',
    description: 'ฐานรากเสาเข็ม 4 ต้นจัดเรียงสี่เหลี่ยมจัตุรัสรับแรงเสาหลัก',
    method: 'USD',
    params: {
      width: 1.8, // m
      length: 1.8, // m
      thickness: 70, // cm
      pileSpacing: 0.9, // m
      serviceLoad: 72000, // kg
      factoredLoad: 108000, // kg
      barSize: 'DB16'
    }
  }
];
