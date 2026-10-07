import React from 'react';
import { StructuralCategory, StructuralMemberData } from '../types/structure';
import { Layers, Columns, Milestone, ArrowDownCircle, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface StructuralSelectorProps {
  categories: { id: StructuralCategory; label: string; count: number }[];
  activeCategory: StructuralCategory;
  onSelectCategory: (cat: StructuralCategory) => void;
  members: StructuralMemberData[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
}

export const StructuralSelector: React.FC<StructuralSelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  members,
  selectedMemberId,
  onSelectMember
}) => {
  const filteredMembers = members.filter(m => m.category === activeCategory);

  const getCategoryIcon = (cat: StructuralCategory) => {
    switch (cat) {
      case 'slab':
        return <Layers className="w-4 h-4" />;
      case 'beam':
        return <Milestone className="w-4 h-4" />;
      case 'stair':
        return <Compass className="w-4 h-4" />;
      case 'column':
        return <Columns className="w-4 h-4" />;
      case 'footing':
        return <ArrowDownCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Structural Member Cards in Active Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {filteredMembers.map((m) => {
          const isSelected = selectedMemberId === m.id;
          const isSafe = m.result?.isSafe ?? true;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMember(m.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                  : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {m.tag}
                </span>
                {isSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                  {m.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {m.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5 mt-0.5">
                <span className="font-semibold text-sky-400">{m.method}</span>
                <span>D/C: {m.result ? `${(m.result.maxRatio * 100).toFixed(0)}%` : '0%'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
