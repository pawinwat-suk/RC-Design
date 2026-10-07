/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StructuralCategory, StructuralMemberData, ProjectMetadata, MaterialCriteria } from './types/structure';
import { DEFAULT_PROJECT, DEFAULT_CRITERIA } from './utils/engineeringData';
import { INITIAL_MEMBERS } from './utils/defaultStructures';
import { calculateStructure } from './utils/engineeringMath';
import { Header } from './components/Header';
import { StructuralSelector } from './components/StructuralSelector';
import { StructuralForm } from './components/StructuralForm';
import { DiagramViewer } from './components/DiagramViewer';
import { CalculationDetails } from './components/CalculationDetails';
import { ProjectCriteriaModal } from './components/ProjectCriteriaModal';
import { ReportModal } from './components/ReportModal';
import { DeveloperProfileModal } from './components/DeveloperProfileModal';
import { Award, BookOpen, CheckCircle2, ShieldAlert, Sparkles, Building, ChevronRight } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ProjectMetadata>(() => {
    const saved = localStorage.getItem('rc_project_data');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECT;
  });

  const [criteria, setCriteria] = useState<MaterialCriteria>(() => {
    const saved = localStorage.getItem('rc_criteria_data');
    return saved ? JSON.parse(saved) : DEFAULT_CRITERIA;
  });

  const [members, setMembers] = useState<StructuralMemberData[]>(() => {
    const saved = localStorage.getItem('rc_members_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MEMBERS.map(m => ({
      ...m,
      result: calculateStructure(m, DEFAULT_CRITERIA)
    }));
  });

  const [activeCategory, setActiveCategory] = useState<StructuralCategory>('slab');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('sog-1');

  // Modal controls
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDevProfileOpen, setIsDevProfileOpen] = useState(false);

  // Auto calculate when members or criteria change
  useEffect(() => {
    setMembers(prev => prev.map(item => ({
      ...item,
      result: calculateStructure(item, criteria)
    })));
  }, [criteria]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('rc_project_data', JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem('rc_criteria_data', JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem('rc_members_data', JSON.stringify(members));
  }, [members]);

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const handleUpdateMember = (updated: StructuralMemberData) => {
    const withResult = {
      ...updated,
      result: calculateStructure(updated, criteria)
    };
    setMembers(prev => prev.map(m => m.id === updated.id ? withResult : m));
  };

  const handleSelectCategory = (cat: StructuralCategory) => {
    setActiveCategory(cat);
    const firstInCat = members.find(m => m.category === cat);
    if (firstInCat) {
      setSelectedMemberId(firstInCat.id);
    }
  };

  const categoriesConfig: { id: StructuralCategory; label: string; count: number }[] = [
    { id: 'slab', label: '1. หมวดพื้น (Slabs)', count: members.filter(m => m.category === 'slab').length },
    { id: 'beam', label: '2. หมวดคาน (Beams)', count: members.filter(m => m.category === 'beam').length },
    { id: 'stair', label: '3. หมวดบันได (Stairs)', count: members.filter(m => m.category === 'stair').length },
    { id: 'column', label: '4. หมวดเสา (Columns)', count: members.filter(m => m.category === 'column').length },
    { id: 'footing', label: '5. หมวดฐานราก (Footings)', count: members.filter(m => m.category === 'footing').length },
  ];

  // Overall statistics
  const safeCount = members.filter(m => m.result?.isSafe).length;
  const totalCount = members.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        project={project}
        criteria={criteria}
        onOpenCriteria={() => setIsCriteriaOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenDevProfile={() => setIsDevProfileOpen(true)}
      />

      {/* Main Engineering Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Project Status Summary Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                ระบบคำนวณโครงสร้าง ค.ส.ล. มาตรฐาน ว.ส.ท. & ACI 318
              </span>
              <span className="text-xs text-slate-400">• กฎกระทรวง ฉบับที่ 6 พ.ศ. 2527</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>{project.projectName}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">({project.projectCode})</span>
            </h2>
            <p className="text-xs text-slate-400">
              วิศวกรผู้คำนวณ: <span className="text-slate-200 font-semibold">{project.engineerName}</span> | {project.licenseNumber} ({project.licenseLevel})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                ความปลอดภัยโครงสร้าง
              </span>
              <div className="flex items-center gap-2 text-sm font-bold font-mono">
                <span className="text-emerald-400">{safeCount} ผ่าน</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300">{totalCount} ชิ้นส่วน</span>
              </div>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>เปิดเล่มรายงาน PDF</span>
            </button>
          </div>
        </div>

        {/* Structural Category & Member Selector */}
        <StructuralSelector
          categories={categoriesConfig}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={(id) => setSelectedMemberId(id)}
        />

        {/* Active Structural Member Title Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-mono font-bold px-2 py-0.5 rounded text-xs">
              {selectedMember.tag}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              {selectedMember.name}
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              — {selectedMember.description}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            วิธีคำนวณ: <span className="font-semibold text-amber-400">{selectedMember.method}</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Inputs & Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <StructuralForm
              member={selectedMember}
              onChange={handleUpdateMember}
            />
          </div>

          {/* Right Column: Interactive Visual Diagram (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DiagramViewer member={selectedMember} />
          </div>
        </div>

        {/* Full-Width Detailed Step-by-Step Calculation Engine Output */}
        <CalculationDetails
          member={selectedMember}
          criteria={criteria}
        />
      </main>

      {/* Footer & Developer Credits Banner */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 mt-12 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDevProfileOpen(true)}
              className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>พัฒนาโดย {project.developerCredit}</span>
            </button>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <span>คำนวณตามมาตรฐาน ว.ส.ท. 1007-34, ACI 318 และกฎกระทรวง ฉบับที่ 6 พ.ศ. 2527</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectCriteriaModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
        project={project}
        criteria={criteria}
        onSaveProject={setProject}
        onSaveCriteria={setCriteria}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        project={project}
        criteria={criteria}
        members={members}
      />

      <DeveloperProfileModal
        isOpen={isDevProfileOpen}
        onClose={() => setIsDevProfileOpen(false)}
      />
    </div>
  );
}
