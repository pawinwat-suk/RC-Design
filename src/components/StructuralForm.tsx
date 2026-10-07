import React from 'react';
import { StructuralMemberData, DesignMethod } from '../types/structure';
import { Sliders, Wrench, Shield, Zap } from 'lucide-react';

interface StructuralFormProps {
  member: StructuralMemberData;
  onChange: (updated: StructuralMemberData) => void;
}

export const StructuralForm: React.FC<StructuralFormProps> = ({ member, onChange }) => {
  const handleParamChange = (field: string, value: any) => {
    onChange({
      ...member,
      params: {
        ...member.params,
        [field]: value
      }
    });
  };

  const handleMethodChange = (method: DesignMethod) => {
    onChange({
      ...member,
      method
    });
  };

  const renderInputsForType = () => {
    switch (member.type) {
      case 'slab_on_ground':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความหนาพื้นคอนกรีต (t, ซม.)</label>
              <input
                type="number"
                step="1"
                value={member.params.thickness || 15}
                onChange={(e) => handleParamChange('thickness', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ค่าโมดูลัสปฏิกิริยาดิน k (kg/cm³)</label>
              <input
                type="number"
                step="0.5"
                value={member.params.subgradeReaction || 5}
                onChange={(e) => handleParamChange('subgradeReaction', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">น้ำหนักกดจุด/ล้อรถยนต์ (kg)</label>
              <input
                type="number"
                step="100"
                value={member.params.pointLoad || 1500}
                onChange={(e) => handleParamChange('pointLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ระยะรอยต่อคอนกรีต Joint Spacing (ม.)</label>
              <input
                type="number"
                step="0.5"
                value={member.params.jointSpacing || 4.0}
                onChange={(e) => handleParamChange('jointSpacing', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </>
        );

      case 'slab_two_way':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ช่วงพาดด้านสั้น S (ม.)</label>
              <input
                type="number"
                step="0.1"
                value={member.params.shortSpan || 3.5}
                onChange={(e) => handleParamChange('shortSpan', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ช่วงพาดด้านยาว L (ม.)</label>
              <input
                type="number"
                step="0.1"
                value={member.params.longSpan || 4.5}
                onChange={(e) => handleParamChange('longSpan', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความหนาแผ่นพื้น t (ซม.)</label>
              <input
                type="number"
                step="1"
                value={member.params.thickness || 12}
                onChange={(e) => handleParamChange('thickness', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">น้ำหนักบรรทุกจร LL (kg/m²)</label>
              <input
                type="number"
                step="50"
                value={member.params.liveLoad || 150}
                onChange={(e) => handleParamChange('liveLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ขนาดเหล็กเสริมหลัก</label>
              <select
                value={member.params.barSize || 'DB10'}
                onChange={(e) => handleParamChange('barSize', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="RB9">RB9 (SR24)</option>
                <option value="DB10">DB10 (SD30/40)</option>
                <option value="DB12">DB12 (SD40)</option>
              </select>
            </div>
          </>
        );

      case 'beam_simple':
      case 'beam_continuous':
      case 'beam_cantilever':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความยาวช่วงคาน L (ม.)</label>
              <input
                type="number"
                step="0.1"
                value={member.params.span || 4.0}
                onChange={(e) => handleParamChange('span', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความกว้างคาน b (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.width || 20}
                onChange={(e) => handleParamChange('width', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความลึกคาน h (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.height || 40}
                onChange={(e) => handleParamChange('height', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">น้ำหนักคงที่เพิ่มเติม DL (kg/m)</label>
              <input
                type="number"
                step="50"
                value={member.params.deadLoad || 450}
                onChange={(e) => handleParamChange('deadLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">น้ำหนักบรรทุกจร LL (kg/m)</label>
              <input
                type="number"
                step="50"
                value={member.params.liveLoad || 300}
                onChange={(e) => handleParamChange('liveLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ขนาดเหล็กข้ออ้อยรับแรงดัด</label>
              <select
                value={member.params.barSize || 'DB16'}
                onChange={(e) => handleParamChange('barSize', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="DB12">DB12</option>
                <option value="DB16">DB16</option>
                <option value="DB20">DB20</option>
                <option value="DB25">DB25</option>
              </select>
            </div>
          </>
        );

      case 'column_rect_short':
      case 'column_rect_slender':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความกว้างเสา b (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.width || 25}
                onChange={(e) => handleParamChange('width', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความลึกเสา h (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.height || 25}
                onChange={(e) => handleParamChange('height', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">แรงอัดแกนเสาประลัย Pu (kg)</label>
              <input
                type="number"
                step="2000"
                value={member.params.axialLoad || 38000}
                onChange={(e) => handleParamChange('axialLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            {member.type.includes('slender') && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">ความสูงปราศจากค้ำยัน Lu (ม.)</label>
                <input
                  type="number"
                  step="0.2"
                  value={member.params.clearHeight || 4.2}
                  onChange={(e) => handleParamChange('clearHeight', parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 block mb-1">ขนาดเหล็กยืน</label>
              <select
                value={member.params.barSize || 'DB16'}
                onChange={(e) => handleParamChange('barSize', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="DB12">DB12</option>
                <option value="DB16">DB16</option>
                <option value="DB20">DB20</option>
              </select>
            </div>
          </>
        );

      case 'column_circle_short':
      case 'column_circle_slender':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">เส้นผ่านศูนย์กลางเสากลม D (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.diameter || 30}
                onChange={(e) => handleParamChange('diameter', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">แรงอัดแกนเสาประลัย Pu (kg)</label>
              <input
                type="number"
                step="2000"
                value={member.params.axialLoad || 45000}
                onChange={(e) => handleParamChange('axialLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">จำนวนเหล็กยืน (เส้น, ขั้นต่ำ 6)</label>
              <input
                type="number"
                min="6"
                max="16"
                step="2"
                value={member.params.barCount || 6}
                onChange={(e) => handleParamChange('barCount', parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </>
        );

      case 'footing_isolated_spread':
      case 'footing_combined_spread':
      case 'footing_pile_single':
      case 'footing_pile_two':
      case 'footing_pile_three':
      case 'footing_pile_four':
        return (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความกว้างฐานราก B (ม.)</label>
              <input
                type="number"
                step="0.1"
                value={member.params.width || 1.5}
                onChange={(e) => handleParamChange('width', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ความหนาฐานราก d_total (ซม.)</label>
              <input
                type="number"
                step="5"
                value={member.params.thickness || 40}
                onChange={(e) => handleParamChange('thickness', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">น้ำหนักลงเสาตอม่อใช้งาน P (kg)</label>
              <input
                type="number"
                step="2000"
                value={member.params.serviceLoad || 20000}
                onChange={(e) => handleParamChange('serviceLoad', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ขนาดเหล็กเสริมตะแกรงล่าง</label>
              <select
                value={member.params.barSize || 'DB12'}
                onChange={(e) => handleParamChange('barSize', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="DB12">DB12</option>
                <option value="DB16">DB16</option>
                <option value="DB20">DB20</option>
              </select>
            </div>
          </>
        );

      default:
        return (
          <div>
            <label className="text-xs text-slate-400 block mb-1">ช่วงพาด / มิติหลัก (ม.)</label>
            <input
              type="number"
              step="0.2"
              value={member.params.span || 3.0}
              onChange={(e) => handleParamChange('span', parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm md:text-base">
            พารามิเตอร์และข้อกำหนดการออกแบบ (Design Parameters)
          </h3>
        </div>

        {/* Design Method Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => handleMethodChange('USD')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              member.method === 'USD'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            USD (ACI 318)
          </button>
          <button
            onClick={() => handleMethodChange('WSD')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              member.method === 'WSD'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WSD (วสท.)
          </button>
        </div>
      </div>

      {/* Basic metadata tags */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <label className="text-xs text-slate-400 block mb-1">รหัสชิ้นส่วน (Tag ID)</label>
          <input
            type="text"
            value={member.tag}
            onChange={(e) => onChange({ ...member, tag: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 font-bold focus:border-amber-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">คำอธิบายตำแหน่งในอาคาร</label>
          <input
            type="text"
            value={member.description}
            onChange={(e) => onChange({ ...member, description: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Dynamic structural input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {renderInputsForType()}
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          ระบบคำนวณแบบ Real-time ตามกฎกระทรวงและมาตรฐาน ว.ส.ท.
        </span>
        <span className="text-emerald-400 font-mono">Auto-recalculated</span>
      </div>
    </div>
  );
};
