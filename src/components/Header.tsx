import React from 'react';
import { ProjectMetadata, MaterialCriteria } from '../types/structure';
import { HardHat, FileSpreadsheet, Settings, Award, Layers, ShieldCheck, Printer } from 'lucide-react';
import { DeveloperPortrait } from './DeveloperPortrait';

interface HeaderProps {
  project: ProjectMetadata;
  criteria: MaterialCriteria;
  onOpenCriteria: () => void;
  onOpenReport: () => void;
  onOpenDevProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  criteria,
  onOpenCriteria,
  onOpenReport,
  onOpenDevProfile
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                RC Structural Design
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                วสท. / ACI 318
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {project.projectName} • {project.buildingType}
            </p>
          </div>
        </div>

        {/* Quick action buttons & Developer credit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Developer badge shortcut */}
          <button
            onClick={onOpenDevProfile}
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800 border border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer group"
            title="ผู้พัฒนาโปรแกรม: นายปวินท์วัฒน์ สุขขี"
          >
            <DeveloperPortrait size="sm" showBadge={false} allowUpload={false} />
            <div className="hidden lg:block text-left text-xs">
              <span className="text-[10px] text-amber-400 font-bold block uppercase leading-none">
                ผู้พัฒนาโปรแกรม
              </span>
              <span className="text-slate-200 font-bold group-hover:text-amber-300">
                นายปวินท์วัฒน์ สุขขี
              </span>
            </div>
          </button>

          {/* Criteria Settings */}
          <button
            onClick={onOpenCriteria}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="กำหนดข้อมูลโครงการและเกณฑ์วัสดุ"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">เกณฑ์การออกแบบ & ผู้ออกแบบ</span>
          </button>

          {/* PDF Report Export */}
          <button
            onClick={onOpenReport}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">ออกรายงาน PDF / หน้าปก</span>
            <span className="sm:hidden">รายงาน PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
