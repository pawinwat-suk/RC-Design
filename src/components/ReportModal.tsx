import React from 'react';
import { ProjectMetadata, MaterialCriteria, StructuralMemberData } from '../types/structure';
import { X, Printer, Download, Award, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DeveloperPortrait } from './DeveloperPortrait';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectMetadata;
  criteria: MaterialCriteria;
  members: StructuralMemberData[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  project,
  criteria,
  members
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Container */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[96vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Top Bar - hidden during print */}
        <div className="no-print p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                ตัวอย่างเล่มรายการคำนวณโครงสร้าง ค.ส.ล. (Official Structural Calculation Book)
              </h2>
              <p className="text-xs text-slate-400">
                พร้อมหน้าปกทางการ และรายละเอียดการคำนวณครบทุกชิ้นส่วน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึกเป็น PDF (Print to PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="print-area" className="p-4 sm:p-8 space-y-12 bg-white text-slate-900 overflow-y-auto">
          
          {/* ============================================================== */}
          {/* PAGE 1: COVER PAGE (หน้าปกสวยงาม) */}
          {/* ============================================================== */}
          <div className="min-h-[1050px] border-8 border-double border-amber-600/60 p-8 sm:p-12 relative flex flex-col justify-between rounded-xl bg-gradient-to-b from-amber-50/20 via-white to-amber-50/30 print-avoid-break">
            {/* Top Emblem and Header */}
            <div className="text-center space-y-4">
              {/* Royal Engineering Seal Ornament */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600/70 bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg text-slate-950">
                  <ShieldCheck className="w-12 h-12" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-800 uppercase block">
                  เอกสารประกอบการยื่นขออนุญาตก่อสร้างตาม พ.ร.บ. ควบคุมอาคาร
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  รายการคำนวณโครงสร้างคอนกรีตเสริมเหล็ก
                </h1>
                <h2 className="text-lg sm:text-xl font-bold text-amber-900">
                  REINFORCED CONCRETE STRUCTURAL CALCULATION NOTE
                </h2>
              </div>

              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
            </div>

            {/* Project Information Box */}
            <div className="my-6 border-2 border-slate-300 rounded-2xl p-6 bg-slate-50/80 shadow-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-500 block text-xs">โครงการ (PROJECT):</span>
                  <span className="text-base font-bold text-slate-900">{project.projectName}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-xs">ประเภทอาคาร (BUILDING TYPE):</span>
                  <span className="text-base font-bold text-slate-900">{project.buildingType}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-xs">เจ้าของอาคาร (OWNER):</span>
                  <span className="text-sm font-bold text-slate-800">{project.ownerName}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-xs">สถานที่ก่อสร้าง (LOCATION):</span>
                  <span className="text-sm font-bold text-slate-800">{project.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">เกณฑ์มาตรฐานที่ใช้ออกแบบ:</span>
                  <p className="text-slate-800 mt-0.5">
                    • มาตรฐาน ว.ส.ท. 1007-34 / ACI 318-19<br />
                    • กฎกระทรวง ฉบับที่ 6 (พ.ศ. 2527) ออกตามความใน พ.ร.บ. ควบคุมอาคาร พ.ศ. 2522
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">คุณสมบัติวัสดุหลัก:</span>
                  <p className="text-slate-800 mt-0.5">
                    • คอนกรีต f'c = {criteria.fc_cylinder.toFixed(0)} ksc (Cube {criteria.fc_ksc} ksc)<br />
                    • เหล็กเสริมหลัก SD40 (fy = {criteria.fy_main} ksc), เหล็กปลอก SR24 (fy = {criteria.fy_stirrup} ksc)
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Credit & Photo Section (นายปวินท์วัฒน์ สุขขี ผู้พัฒนาโปรแกรม) */}
            <div className="my-4 p-5 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-50 via-sky-50/40 to-amber-50/50 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <div className="shrink-0 flex flex-col items-center">
                <DeveloperPortrait size="lg" showBadge={true} allowUpload={true} />
              </div>
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>ผู้พัฒนาโปรแกรมวิศวกรรมโครงสร้าง ค.ส.ล.</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {project.developerCredit}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  พัฒนาและออกแบบระบบการคำนวณโครงสร้างคอนกรีตเสริมเหล็กตามมาตรฐานพระราชบัญญัติควบคุมอาคาร พ.ศ. 2522, 
                  กฎกระทรวงฉบับที่ 6 (พ.ศ. 2527) และมาตรฐานสมาคมวิศวกรรมสถานแห่งประเทศไทย (ว.ส.ท.) / ACI 318
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    ✓ วิเคราะห์พฤติกรรมโครงสร้างสมบูรณ์แบบ
                  </span>
                  <span className="bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    ✓ ไดอะแกรม SFD, BMD & Whitney Stress Block
                  </span>
                  <span className="bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    ✓ สรุปรายละเอียดเหล็กเสริมมาตรฐานงานก่อสร้าง
                  </span>
                </div>
              </div>
            </div>

            {/* Engineer Signature & Certification Block */}
            <div className="mt-4 pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-8 items-end">
              <div className="text-xs text-slate-600 space-y-1">
                <p><span className="font-semibold">วันที่คำนวณ:</span> {project.designDate}</p>
                <p><span className="font-semibold">รหัสอ้างอิง:</span> {project.projectCode}</p>
                <p className="text-[11px] text-slate-500">เอกสารนี้สร้างขึ้นโดยโปรแกรมคำนวณวิศวกรรม ค.ส.ล. อัตโนมัติ</p>
              </div>

              <div className="text-center border border-slate-400 p-4 rounded-xl bg-white shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">ลงชื่อวิศวกรผู้คำนวณและออกแบบ</span>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center">
                  <span className="font-serif italic text-slate-600 text-sm">({project.engineerName})</span>
                </div>
                <div className="text-xs text-slate-800">
                  <p className="font-bold">{project.engineerName}</p>
                  <p className="font-mono text-[11px] text-amber-800">{project.licenseNumber} ({project.licenseLevel})</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PAGE 2: DESIGN CRITERIA & CODE STANDARDS */}
          {/* ============================================================== */}
          <div className="print-page-break min-h-[1050px] p-6 space-y-6 border border-slate-200 rounded-xl bg-white">
            <div className="border-b-2 border-amber-600 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  หมวดที่ 1: ข้อกำหนดและเกณฑ์การออกแบบ (DESIGN CRITERIA)
                </h2>
                <span className="text-xs text-slate-500">
                  โครงการ: {project.projectName} | วันที่: {project.designDate}
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-md">
                หน้า 2
              </span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-sm text-slate-900">1. กฎหมายและมาตรฐานอ้างอิง (Codes and Standards)</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>พระราชบัญญัติควบคุมอาคาร พ.ศ. 2522 และฉบับแก้ไขเพิ่มเติม</li>
                  <li>กฎกระทรวง ฉบับที่ 6 (พ.ศ. 2527) ว่าด้วยเรื่องการรับน้ำหนัก ความต้านทาน ความคงทนของอาคาร</li>
                  <li>มาตรฐานสำหรับอาคารคอนกรีตเสริมเหล็ก โดยวิธีกำลัง (SDM / USD) ว.ส.ท. 1007-34</li>
                  <li>ACI 318 (Building Code Requirements for Structural Concrete) สถาบันคอนกรีตแห่งสหรัฐอเมริกา</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-sm text-slate-900">2. กำลังวัสดุก่อสร้าง (Material Strengths)</h3>
                <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800">
                      <th className="border border-slate-300 p-2">วัสดุ</th>
                      <th className="border border-slate-300 p-2">มาตรฐาน</th>
                      <th className="border border-slate-300 p-2">กำลังออกแบบ (Design Value)</th>
                      <th className="border border-slate-300 p-2">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2 font-semibold">คอนกรีตโครงสร้าง (Concrete)</td>
                      <td className="border border-slate-300 p-2">มอก. 213-2559</td>
                      <td className="border border-slate-300 p-2">f'c = {criteria.fc_cylinder.toFixed(1)} ksc (Cylinder) / Cube {criteria.fc_ksc} ksc</td>
                      <td className="border border-slate-300 p-2">Ec = {criteria.Ec.toLocaleString()} ksc</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-semibold">เหล็กเส้นข้ออ้อย (Deformed Bar)</td>
                      <td className="border border-slate-300 p-2">มอก. 24-2559 (SD40)</td>
                      <td className="border border-slate-300 p-2">fy = {criteria.fy_main} ksc</td>
                      <td className="border border-slate-300 p-2">เหล็กเสริมหลักคาน เสา ฐานราก</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-semibold">เหล็กเส้นกลมผิวเรียบ (Round Bar)</td>
                      <td className="border border-slate-300 p-2">มอก. 20-2559 (SR24)</td>
                      <td className="border border-slate-300 p-2">fy = {criteria.fy_stirrup} ksc</td>
                      <td className="border border-slate-300 p-2">เหล็กปลอกและเหล็กกันร้าว</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-semibold">ดินฐานราก / เสาเข็ม</td>
                      <td className="border border-slate-300 p-2">วิศวกรรมปฐพี</td>
                      <td className="border border-slate-300 p-2">qa = {criteria.soil_bearing_capacity} ton/m² | เข็ม {criteria.pile_safe_load} ton/ต้น</td>
                      <td className="border border-slate-300 p-2">น้ำหนักปลอดภัย (Safe Load)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-sm text-slate-900">3. น้ำหนักบรรทุกออกแบบ (Design Loads)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 p-2.5 rounded bg-white">
                    <span className="font-bold block text-slate-800">น้ำหนักบรรทุกคงที่ (Dead Load):</span>
                    <p>• คอนกรีตเสริมเหล็ก: 2,400 kg/m³</p>
                    <p>• ปูนทรายปรับระดับและกระเบื้อง: 100 kg/m²</p>
                    <p>• ผนังก่ออิฐมอญครึ่งแผ่นฉาบปูน: 180 kg/m²</p>
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded bg-white">
                    <span className="font-bold block text-slate-800">น้ำหนักบรรทุกจร (Live Load ตามกฎกระทรวง):</span>
                    <p>• ห้องนอน / ห้องนั่งเล่น: 150 kg/m²</p>
                    <p>• ระเบียงและบันได: 300 kg/m²</p>
                    <p>• หลังคาคอนกรีตดาดฟ้า: 100 kg/m²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PAGE 3+: DETAILED STRUCTURAL CALCULATIONS */}
          {/* ============================================================== */}
          {members.map((member, index) => {
            const res = member.result;
            return (
              <div
                key={member.id}
                className="print-page-break min-h-[1050px] p-6 space-y-5 border border-slate-200 rounded-xl bg-white text-xs print-avoid-break"
              >
                {/* Member Header */}
                <div className="border-b-2 border-slate-800 pb-2 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white font-mono font-bold px-2.5 py-0.5 rounded text-sm">
                        {member.tag}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {member.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {member.description} | วิธีคำนวณ: {member.method}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-md">
                    หน้า {index + 3}
                  </span>
                </div>

                {/* Loads & Internal Forces Table */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold block text-slate-800">ข้อมูลแรงและขนาดที่ใช้คำนวณ:</span>
                    {Object.entries(member.params).map(([k, v]) => (
                      <p key={k} className="text-slate-600 font-mono">
                        {k}: <span className="font-bold text-slate-800">{v}</span>
                      </p>
                    ))}
                  </div>
                  <div>
                    <span className="font-bold block text-slate-800">ผลแรงภายในวิกฤต (Internal Forces):</span>
                    {res?.internalForces.maxMoment !== undefined && (
                      <p className="font-mono">M_max = <span className="font-bold text-amber-700">{res.internalForces.maxMoment} kg-m</span></p>
                    )}
                    {res?.internalForces.maxShear !== undefined && (
                      <p className="font-mono">V_max = <span className="font-bold text-sky-700">{res.internalForces.maxShear} kg</span></p>
                    )}
                    {res?.internalForces.maxAxial !== undefined && (
                      <p className="font-mono">P_max = <span className="font-bold text-indigo-700">{res.internalForces.maxAxial} kg</span></p>
                    )}
                    {res?.internalForces.soilPressure !== undefined && (
                      <p className="font-mono">q_soil = <span className="font-bold text-emerald-700">{res.internalForces.soilPressure} ton/m²</span></p>
                    )}
                  </div>
                </div>

                {/* Step by Step Math Calculations */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    ขั้นตอนการตรวจสอบและคำนวณกำลัง (Engineering Verification Checks):
                  </span>
                  {res?.checks.map((chk, i) => (
                    <div key={i} className="border border-slate-200 p-2.5 rounded-lg bg-white space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-[11px]">{chk.step}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          chk.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                      <div className="font-mono text-slate-600 text-[11px] bg-slate-50 p-1 rounded">
                        สูตร: {chk.formula}
                      </div>
                      <div className="font-mono text-slate-800 text-[11px]">
                        แทนค่า: {chk.calculation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reinforcement Summary Box */}
                <div className="p-3 rounded-lg border-2 border-emerald-500/40 bg-emerald-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>สรุปการจัดเหล็กเสริมสำหรับแบบก่อสร้าง (Final Rebar Details):</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 pl-5">
                    {res?.reinforcement.mainFlexure && <p>• {res.reinforcement.mainFlexure.label}</p>}
                    {res?.reinforcement.secondaryFlexure && <p>• {res.reinforcement.secondaryFlexure.label}</p>}
                    {res?.reinforcement.topBars && <p>• {res.reinforcement.topBars.label}</p>}
                    {res?.reinforcement.bottomBars && <p>• {res.reinforcement.bottomBars.label}</p>}
                    {res?.reinforcement.shearStirrups && <p>• {res.reinforcement.shearStirrups.label}</p>}
                    {res?.reinforcement.tiesOrSpiral && <p>• {res.reinforcement.tiesOrSpiral.label}</p>}
                    {res?.reinforcement.temperatureBars && <p>• {res.reinforcement.temperatureBars.label}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
