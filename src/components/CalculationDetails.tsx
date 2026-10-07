import React from 'react';
import { StructuralMemberData, MaterialCriteria } from '../types/structure';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Shield, Info } from 'lucide-react';

interface CalculationDetailsProps {
  member: StructuralMemberData;
  criteria: MaterialCriteria;
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({ member, criteria }) => {
  const result = member.result;

  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        กำลังคำนวณโครงสร้าง...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header and Safety Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-lg">
              รายการคำนวณวิศวกรรมโดยละเอียด (Detailed Structural Calculation)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            อ้างอิง: มาตรฐาน ว.ส.ท. 1007-34 / ACI 318-19 และกฎกระทรวง ฉบับที่ 6 (พ.ศ. 2527)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold text-sm ${
            result.isSafe 
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
              : 'bg-rose-950/60 border-rose-500/50 text-rose-400'
          }`}>
            {result.isSafe ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>โครงสร้างปลอดภัย (PASS)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>ต้องปรับขนาด/เหล็กเสริม (FAIL)</span>
              </>
            )}
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Critical D/C Ratio: </span>
            <span className={`font-mono font-bold ${
              result.maxRatio <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(result.maxRatio * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Applied Loads & Criteria Summary Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 block">กำลังคอนกรีต f'c:</span>
          <span className="font-mono font-semibold text-slate-200">
            {criteria.fc_cylinder.toFixed(1)} ksc (Cube {criteria.fc_ksc})
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">กำลังเหล็กเสริมหลัก fy:</span>
          <span className="font-mono font-semibold text-slate-200">
            {criteria.fy_main} ksc (SD40)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">วิธีคำนวณ (Method):</span>
          <span className="font-mono font-semibold text-amber-400">
            {member.method === 'USD' ? 'กำลังประลัย (USD - ACI 318)' : 'หน่วยแรงใช้งาน (WSD - วสท.)'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">สถานะชิ้นส่วน:</span>
          <span className="font-mono font-semibold text-sky-400">
            {member.tag}: {member.name}
          </span>
        </div>
      </div>

      {/* Step by Step Engineering Formula Calculation */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          ขั้นตอนการตรวจสอบและคำนวณกำลังโครงสร้าง (Step-by-Step Code Verification)
        </h4>

        <div className="space-y-2.5">
          {result.checks.map((check, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-xl border transition-all ${
                check.status === 'PASS'
                  ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  : check.status === 'FAIL'
                  ? 'bg-rose-950/30 border-rose-800/70'
                  : 'bg-sky-950/30 border-sky-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">
                      {check.step}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800/60 font-mono text-xs text-sky-300">
                    <span className="text-slate-400 text-[11px] block">สูตรคำนวณตามมาตรฐาน:</span>
                    {check.formula}
                  </div>

                  <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                    <span className="text-slate-400">แทนค่าคำนวณ:</span>
                    <span className="text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {check.calculation}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    check.status === 'PASS'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/40'
                      : check.status === 'FAIL'
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-600/40'
                      : 'bg-sky-900/60 text-sky-300 border border-sky-600/40'
                  }`}>
                    {check.status === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                    {check.status === 'FAIL' && <XCircle className="w-3 h-3" />}
                    {check.status === 'INFO' && <Info className="w-3 h-3" />}
                    {check.status}
                  </span>
                  {check.ratio !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Demand/Cap: {(check.ratio * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Reinforcement Callout */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-amber-300">
            สรุปขนาดและเหล็กเสริมที่แนะนำสำหรับก่อสร้างจริง (Constructive Rebar Specification)
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {result.reinforcement.mainFlexure && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กเสริมรับโมเมนต์ดัดหลัก:</span>
              <span className="font-bold text-sky-400 font-mono">
                {result.reinforcement.mainFlexure.label}
              </span>
            </div>
          )}
          {result.reinforcement.secondaryFlexure && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กเสริมทิศทางรอง:</span>
              <span className="font-bold text-sky-400 font-mono">
                {result.reinforcement.secondaryFlexure.label}
              </span>
            </div>
          )}
          {result.reinforcement.topBars && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กเสริมบน (Top Rebars):</span>
              <span className="font-bold text-sky-400 font-mono">
                {result.reinforcement.topBars.label}
              </span>
            </div>
          )}
          {result.reinforcement.bottomBars && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กเสริมล่าง (Bottom Rebars):</span>
              <span className="font-bold text-sky-400 font-mono">
                {result.reinforcement.bottomBars.label}
              </span>
            </div>
          )}
          {result.reinforcement.shearStirrups && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กปลอกรับแรงเฉือน:</span>
              <span className="font-bold text-amber-400 font-mono">
                {result.reinforcement.shearStirrups.label}
              </span>
            </div>
          )}
          {result.reinforcement.tiesOrSpiral && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กปลอกเดี่ยว/เกลียวเสา:</span>
              <span className="font-bold text-amber-400 font-mono">
                {result.reinforcement.tiesOrSpiral.label}
              </span>
            </div>
          )}
          {result.reinforcement.temperatureBars && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">เหล็กเสริมกันร้าว (Temp/Shrinkage):</span>
              <span className="font-bold text-emerald-400 font-mono">
                {result.reinforcement.temperatureBars.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
