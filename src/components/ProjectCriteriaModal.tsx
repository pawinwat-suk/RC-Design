import React from 'react';
import { ProjectMetadata, MaterialCriteria } from '../types/structure';
import { X, Save, Building2, UserCheck, HardHat, FileText, CheckCircle2 } from 'lucide-react';
import { DeveloperPortrait } from './DeveloperPortrait';

interface ProjectCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectMetadata;
  criteria: MaterialCriteria;
  onSaveProject: (p: ProjectMetadata) => void;
  onSaveCriteria: (c: MaterialCriteria) => void;
}

export const ProjectCriteriaModal: React.FC<ProjectCriteriaModalProps> = ({
  isOpen,
  onClose,
  project,
  criteria,
  onSaveProject,
  onSaveCriteria
}) => {
  const [projData, setProjData] = React.useState<ProjectMetadata>(project);
  const [critData, setCritData] = React.useState<MaterialCriteria>(criteria);

  if (!isOpen) return null;

  const handleSave = () => {
    // Recompute cylinder if cube
    const fc_cylinder = critData.isCube ? +(critData.fc_ksc * 0.83).toFixed(1) : critData.fc_ksc;
    const Ec = +(15100 * Math.sqrt(fc_cylinder)).toFixed(0);
    const updatedCrit = {
      ...critData,
      fc_cylinder,
      Ec,
      modular_ratio: +(2040000 / Ec).toFixed(2)
    };
    onSaveProject(projData);
    onSaveCriteria(updatedCrit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                ข้อมูลโครงการ & เกณฑ์การออกแบบ (Data Criteria & Project Info)
              </h2>
              <p className="text-xs text-slate-400">
                ระบุข้อมูลผู้ออกแบบและข้อกำหนดวัสดุตามกฎกระทรวงและมาตรฐาน ว.ส.ท.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Project & Engineer Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4" />
              <h3 className="font-bold text-sm">ข้อมูลโครงการและผู้ออกแบบ (Engineer Information)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">ชื่อโครงการ (Project Name)</label>
                <input
                  type="text"
                  value={projData.projectName}
                  onChange={(e) => setProjData({ ...projData, projectName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">เจ้าของอาคาร (Client / Owner)</label>
                <input
                  type="text"
                  value={projData.ownerName}
                  onChange={(e) => setProjData({ ...projData, ownerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">สถานที่ก่อสร้าง (Location)</label>
                <input
                  type="text"
                  value={projData.location}
                  onChange={(e) => setProjData({ ...projData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ประเภทอาคาร (Building Type)</label>
                <input
                  type="text"
                  value={projData.buildingType}
                  onChange={(e) => setProjData({ ...projData, buildingType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ชื่อวิศวกรผู้ออกแบบ (Lead Structural Engineer)</label>
                <input
                  type="text"
                  value={projData.engineerName}
                  onChange={(e) => setProjData({ ...projData, engineerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">เลขที่ใบอนุญาต กว. (COE License No.)</label>
                <input
                  type="text"
                  value={projData.licenseNumber}
                  onChange={(e) => setProjData({ ...projData, licenseNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 font-bold focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ระดับใบอนุญาตวิศวกรรมโยธา</label>
                <select
                  value={projData.licenseLevel}
                  onChange={(e) => setProjData({ ...projData, licenseLevel: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="ภาคีวิศวกรโยธา (ภย.)">ภาคีวิศวกรโยธา (ภย.)</option>
                  <option value="สามัญวิศวกรโยธา (สย.)">สามัญวิศวกรโยธา (สย.)</option>
                  <option value="วุฒิวิศวกรโยธา (วย.)">วุฒิวิศวกรโยธา (วย.)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">วันที่ออกแบบ (Design Date)</label>
                <input
                  type="date"
                  value={projData.designDate}
                  onChange={(e) => setProjData({ ...projData, designDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Material Criteria */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400 border-b border-slate-800 pb-2">
              <UserCheck className="w-4 h-4" />
              <h3 className="font-bold text-sm">คุณสมบัติวัสดุ & กฎกระทรวง (Material Properties & Code Limits)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">กำลังรับแรงอัดคอนกรีต fc' (ksc)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="10"
                    value={critData.fc_ksc}
                    onChange={(e) => setCritData({ ...critData, fc_ksc: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <select
                    value={critData.isCube ? 'cube' : 'cylinder'}
                    onChange={(e) => setCritData({ ...critData, isCube: e.target.value === 'cube' })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs text-slate-300"
                  >
                    <option value="cube">Cube (15x15)</option>
                    <option value="cylinder">Cylinder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">กำลังครากเหล็กหลัก fy (ksc)</label>
                <select
                  value={critData.fy_main}
                  onChange={(e) => setCritData({ ...critData, fy_main: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value={3000}>SD30 (fy = 3,000 ksc)</option>
                  <option value={4000}>SD40 (fy = 4,000 ksc - มาตรฐานบ้านพักอาศัย)</option>
                  <option value={5000}>SD50 (fy = 5,000 ksc)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">กำลังครากเหล็กปลอก fyv (ksc)</label>
                <select
                  value={critData.fy_stirrup}
                  onChange={(e) => setCritData({ ...critData, fy_stirrup: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value={2400}>SR24 (RB6, RB9 @ 2,400 ksc)</option>
                  <option value={3000}>SD30 (DB10 @ 3,000 ksc)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">กำลังรับน้ำหนักปลอดภัยของดิน qa (ton/m²)</label>
                <input
                  type="number"
                  step="1"
                  value={critData.soil_bearing_capacity}
                  onChange={(e) => setCritData({ ...critData, soil_bearing_capacity: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">กำลังรับน้ำหนักปลอดภัยเสาเข็ม (ton/ต้น)</label>
                <input
                  type="number"
                  step="2"
                  value={critData.pile_safe_load}
                  onChange={(e) => setCritData({ ...critData, pile_safe_load: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">น้ำหนักบรรทุกจรที่พักอาศัย LL (kg/m²)</label>
                <input
                  type="number"
                  step="25"
                  value={critData.ll_residential}
                  onChange={(e) => setCritData({ ...critData, ll_residential: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Developer Credit Display */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DeveloperPortrait size="sm" showBadge={false} allowUpload={false} />
              <div>
                <span className="text-[11px] text-amber-400 font-bold block uppercase tracking-wider">
                  ผู้พัฒนาโปรแกรม (Program Developer)
                </span>
                <span className="text-sm font-bold text-slate-100">
                  {projData.developerCredit}
                </span>
                <p className="text-xs text-slate-400">
                  โปรแกรมออกแบบโครงสร้างคอนกรีตเสริมเหล็กตามมาตรฐาน ว.ส.ท. / กฎกระทรวง
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                Official Engineering Build
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูลและเกณฑ์คำนวณ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
