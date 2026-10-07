import React, { useState } from 'react';
import { StructuralMemberData } from '../types/structure';
import { Eye, Layers, TrendingUp, Compass } from 'lucide-react';

interface DiagramViewerProps {
  member: StructuralMemberData;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ member }) => {
  const [activeTab, setActiveTab] = useState<'section' | 'behavior' | 'stress'>('section');
  const result = member.result;

  const renderSectionSVG = () => {
    const isColumn = member.category === 'column';
    const isCircular = member.type.includes('circle');
    const isFooting = member.category === 'footing';
    const isSlab = member.category === 'slab';

    const width = Number(member.params.width || member.params.diameter || member.params.shortSpan || 25);
    const height = Number(member.params.height || member.params.thickness || 40);

    if (isCircular) {
      const D = Number(member.params.diameter || 30);
      const cx = 150;
      const cy = 140;
      const r = 90;
      const barCount = Number(member.params.barCount || 6);

      return (
        <svg viewBox="0 0 300 280" className="w-full h-64 bg-slate-950/60 rounded-xl p-2">
          {/* Circular Concrete Outline */}
          <circle cx={cx} cy={cy} r={r} fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
          
          {/* Spiral tie */}
          <circle cx={cx} cy={cy} r={r - 18} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

          {/* Longitudinal Rebars */}
          {Array.from({ length: barCount }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / barCount;
            const bx = cx + (r - 26) * Math.cos(angle);
            const by = cy + (r - 26) * Math.sin(angle);
            return (
              <circle key={i} cx={bx} cy={by} r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            );
          })}

          {/* Center axis cross */}
          <line x1={cx - 15} y1={cy} x2={cx + 15} y2={cy} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={cx} y1={cy - 15} x2={cx} y2={cy + 15} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />

          {/* Dimension */}
          <line x1="40" y1="250" x2="260" y2="250" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="40" y1="244" x2="40" y2="256" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="260" y1="244" x2="260" y2="256" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="150" y="270" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">
            หน้าตัดเสากลม Ø {D} ซม.
          </text>
        </svg>
      );
    }

    if (isFooting) {
      const isPile = member.type.includes('pile');
      return (
        <svg viewBox="0 0 320 280" className="w-full h-64 bg-slate-950/60 rounded-xl p-2">
          {/* Ground soil level */}
          <line x1="20" y1="90" x2="300" y2="90" stroke="#a3e635" strokeWidth="2" strokeDasharray="5 3" />
          <text x="25" y="82" fill="#a3e635" fontSize="10">ระดับผิวดินเดิม (Ground Level)</text>

          {/* Stub column */}
          <rect x="130" y="50" width="60" height="70" fill="#475569" stroke="#94a3b8" strokeWidth="2" />

          {/* Footing slab */}
          <rect x="40" y="120" width="240" height="75" fill="#334155" stroke="#cbd5e1" strokeWidth="2.5" />

          {/* Rebar bottom mesh */}
          <line x1="55" y1="180" x2="265" y2="180" stroke="#38bdf8" strokeWidth="3" />
          <line x1="55" y1="180" x2="55" y2="160" stroke="#38bdf8" strokeWidth="3" />
          <line x1="265" y1="180" x2="265" y2="160" stroke="#38bdf8" strokeWidth="3" />
          
          {/* Rebar dots */}
          {[80, 110, 140, 160, 180, 210, 240].map((x, idx) => (
            <circle key={idx} cx={x} cy="174" r="4" fill="#f59e0b" />
          ))}

          {/* Lean concrete & sand bed */}
          <rect x="35" y="195" width="250" height="12" fill="#1e293b" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <text x="160" y="204" fill="#94a3b8" fontSize="9" textAnchor="middle">คอนกรีตหยาบรองก้นหลุม 5-10 ซม.</text>

          {/* Piles if pile cap */}
          {isPile && (
            <g>
              <rect x="75" y="195" width="30" height="60" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="215" y="195" width="30" height="60" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="90" y="240" fill="#ffffff" fontSize="9" textAnchor="middle">เสาเข็ม</text>
              <text x="230" y="240" fill="#ffffff" fontSize="9" textAnchor="middle">เสาเข็ม</text>
            </g>
          )}

          <text x="160" y="272" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">
            รูปตัดและเหล็กเสริมฐานราก ({member.tag})
          </text>
        </svg>
      );
    }

    // Standard Beam / Slab / Rectangular column section
    return (
      <svg viewBox="0 0 300 280" className="w-full h-64 bg-slate-950/60 rounded-xl p-2">
        {/* Concrete boundary */}
        <rect x="65" y="40" width="170" height="180" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" rx="4" />
        
        {/* Stirrup */}
        <rect x="80" y="55" width="140" height="150" fill="none" stroke="#f59e0b" strokeWidth="2" rx="3" />
        {/* Stirrup hooks */}
        <path d="M 95 65 L 85 55 L 100 55" fill="none" stroke="#f59e0b" strokeWidth="2" />
        
        {/* Top rebars */}
        <circle cx="95" cy="70" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="205" cy="70" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />

        {/* Bottom rebars */}
        <circle cx="95" cy="190" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="150" cy="190" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="205" cy="190" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />

        {/* Dimension Width */}
        <line x1="65" y1="235" x2="235" y2="235" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="65" y1="230" x2="65" y2="240" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="235" y1="230" x2="235" y2="240" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="150" y="250" fill="#cbd5e1" fontSize="11" textAnchor="middle">b = {width} ซม.</text>

        {/* Dimension Height */}
        <line x1="45" y1="40" x2="45" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1="40" x2="50" y2="40" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1="220" x2="50" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="35" y="135" fill="#cbd5e1" fontSize="11" textAnchor="end">h = {height} ซม.</text>

        {/* Rebar labels */}
        <text x="150" y="270" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
          {result?.reinforcement?.mainFlexure?.label || `เหล็กเสริมหลัก ${result?.reinforcement?.bottomBars?.label || ''}`}
        </text>
      </svg>
    );
  };

  const renderBehaviorDiagram = () => {
    return (
      <div className="w-full h-64 bg-slate-950/60 rounded-xl p-3 flex flex-col justify-between">
        {/* SFD */}
        <div>
          <div className="flex justify-between items-center text-xs text-sky-400 mb-1 font-semibold">
            <span>ไดอะแกรมแรงเฉือน (Shear Force Diagram - SFD)</span>
            <span>V_max = {result?.internalForces?.maxShear || 0} kg</span>
          </div>
          <svg viewBox="0 0 300 65" className="w-full h-16 bg-slate-900 rounded border border-slate-800">
            <line x1="20" y1="32" x2="280" y2="32" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="20,32 20,10 150,32 280,54 280,32" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="30" y="22" fill="#38bdf8" fontSize="10">+V</text>
            <text x="260" y="48" fill="#38bdf8" fontSize="10">-V</text>
          </svg>
        </div>

        {/* BMD */}
        <div>
          <div className="flex justify-between items-center text-xs text-amber-400 mb-1 font-semibold">
            <span>ไดอะแกรมโมเมนต์ดัด (Bending Moment Diagram - BMD)</span>
            <span>M_max = {result?.internalForces?.maxMoment || 0} kg-m</span>
          </div>
          <svg viewBox="0 0 300 70" className="w-full h-18 bg-slate-900 rounded border border-slate-800">
            <line x1="20" y1="20" x2="280" y2="20" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
            {/* Parabolic moment curve */}
            <path d="M 20 20 Q 150 62 280 20" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2" />
            <text x="150" y="52" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">+M (แรงดึงอยู่ด้านล่าง)</text>
          </svg>
        </div>
      </div>
    );
  };

  const renderStressBlock = () => {
    return (
      <svg viewBox="0 0 320 260" className="w-full h-64 bg-slate-950/60 rounded-xl p-2">
        <text x="160" y="25" fill="#f8fafc" fontSize="13" textAnchor="middle" fontWeight="bold">
          บล็อกการกระจายหน่วยแรงสมมูลของวิทนีย์ (Whitney Stress Block)
        </text>

        {/* Concrete cross section */}
        <rect x="40" y="45" width="55" height="160" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="67" cy="180" r="5" fill="#38bdf8" />
        <text x="67" y="220" fill="#94a3b8" fontSize="10" textAnchor="middle">หน้าตัด (Section)</text>

        {/* Strain Profile */}
        <line x1="140" y1="45" x2="140" y2="205" stroke="#64748b" strokeWidth="1" />
        <line x1="165" y1="45" x2="115" y2="180" stroke="#ec4899" strokeWidth="2" />
        <text x="175" y="52" fill="#ec4899" fontSize="10">εc = 0.003</text>
        <text x="125" y="195" fill="#ec4899" fontSize="10">εs &gt;= εy</text>
        <line x1="120" y1="105" x2="160" y2="105" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
        <text x="140" y="100" fill="#cbd5e1" fontSize="9" textAnchor="middle">แกนสะเทิน (N.A.)</text>

        {/* Stress & Force Block */}
        <line x1="210" y1="45" x2="210" y2="205" stroke="#64748b" strokeWidth="1" />
        <rect x="210" y="45" width="50" height="50" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="235" y1="70" x2="280" y2="70" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="285" y="73" fill="#f59e0b" fontSize="10">C = 0.85 f'c b a</text>

        {/* Tension Force Arrow */}
        <line x1="210" y1="180" x2="275" y2="180" stroke="#38bdf8" strokeWidth="2" />
        <text x="280" y="184" fill="#38bdf8" fontSize="10">T = As fy</text>

        {/* Arm */}
        <line x1="200" y1="70" x2="200" y2="180" stroke="#a855f7" strokeWidth="1.5" />
        <text x="190" y="130" fill="#a855f7" fontSize="10" textAnchor="end">jd = d - a/2</text>
      </svg>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm md:text-base">
            ไดอะแกรมพฤติกรรมโครงสร้าง & การจัดเหล็กเสริม
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('section')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'section'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>หน้าตัด/เสริมเหล็ก</span>
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'behavior'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SFD & BMD</span>
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'stress'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>หน่วยแรง (Whitney)</span>
          </button>
        </div>
      </div>

      {activeTab === 'section' && renderSectionSVG()}
      {activeTab === 'behavior' && renderBehaviorDiagram()}
      {activeTab === 'stress' && renderStressBlock()}

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div>
          <span className="text-slate-500">รหัสโครงสร้าง:</span>{' '}
          <span className="font-mono font-bold text-amber-400">{member.tag}</span> - {member.name}
        </div>
        <div className="text-slate-400">
          มาตรฐาน: <span className="text-sky-400 font-semibold">{member.method} (ACI 318 / วสท.)</span>
        </div>
      </div>
    </div>
  );
};
