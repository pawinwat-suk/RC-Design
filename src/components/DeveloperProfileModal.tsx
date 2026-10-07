import React from 'react';
import { X, Award, ShieldCheck, Camera, FileCheck, CheckCircle2 } from 'lucide-react';
import { DeveloperPortrait } from './DeveloperPortrait';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <DeveloperPortrait size="xl" showBadge={true} allowUpload={true} />
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>ผู้พัฒนาโปรแกรมวิศวกรรมโครงสร้าง ค.ส.ล.</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">
              นายปวินท์วัฒน์ สุขขี
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              RC Structural Design Engineer & System Developer
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>มาตรฐานการคำนวณวิศวกรรมที่โปรแกรมรองรับ:</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
            <li>พ.ร.บ. ควบคุมอาคาร พ.ศ. 2522 และกฎกระทรวง ฉบับที่ 6 พ.ศ. 2527</li>
            <li>มาตรฐานสำหรับอาคารคอนกรีตเสริมเหล็ก ว.ส.ท. 1007-34</li>
            <li>ACI 318-19 (Ultimate Strength Design & Working Stress Design)</li>
            <li>วิเคราะห์ครบทั้ง 21 ประเภทโครงสร้าง (พื้น คาน บันได เสา ฐานราก)</li>
            <li>ส่งออกเป็นเล่มรายการคำนวณ A4 พร้อมหน้าปกวิศวกรรมทางการ</li>
          </ul>
        </div>

        <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs text-sky-300 flex items-center gap-2">
          <Camera className="w-4 h-4 shrink-0 text-sky-400" />
          <span>
            สามารถคลิกที่รูปภาพเพื่อเปลี่ยนหรืออัปโหลดรูปถ่ายส่วนตัวเพิ่มเติมได้ทุกเมื่อ (บันทึกลงในเบราว์เซอร์อัตโนมัติ)
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
