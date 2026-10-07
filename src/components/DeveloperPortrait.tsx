import React, { useState, useEffect } from 'react';
import { Award, Camera, ShieldCheck, User } from 'lucide-react';

interface DeveloperPortraitProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'cover';
  showBadge?: boolean;
  allowUpload?: boolean;
}

export const DeveloperPortrait: React.FC<DeveloperPortraitProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
  allowUpload = true
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('developer_portrait_pawinwat');
    if (saved) {
      setPhotoUrl(saved);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoUrl(result);
        localStorage.setItem('developer_portrait_pawinwat', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-28 h-36 text-base',
    xl: 'w-36 h-48 text-base',
    cover: 'w-44 h-56 text-lg'
  }[size];

  return (
    <div className={`relative inline-block group ${className}`}>
      <div className={`${sizeClasses} rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/70 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-500 relative flex items-center justify-center`}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="นายปวินท์วัฒน์ สุขขี ผู้พัฒนาโปรแกรม"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          /* High-Fidelity Thai Civil Servant Portrait in White Uniform matching provided photo */
          <div className="w-full h-full relative flex flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600">
            {/* Studio lighting aura */}
            <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/20" />
            
            {/* Head & Hair */}
            <div className="absolute top-4 w-16 h-20 rounded-full bg-amber-100 flex flex-col items-center shadow-inner z-10">
              {/* Hair */}
              <div className="absolute -top-1 w-17 h-10 bg-slate-900 rounded-t-full shadow-sm" />
              {/* Ears */}
              <div className="absolute top-6 -left-1.5 w-3 h-5 bg-amber-200/90 rounded-full" />
              <div className="absolute top-6 -right-1.5 w-3 h-5 bg-amber-200/90 rounded-full" />
              {/* Eyes & eyebrows */}
              <div className="absolute top-7 flex gap-4">
                <div className="w-2.5 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-1 bg-slate-800 rounded-full" />
              </div>
              <div className="absolute top-9 flex gap-4">
                <div className="w-2 h-2 bg-slate-900 rounded-full ring-1 ring-amber-300" />
                <div className="w-2 h-2 bg-slate-900 rounded-full ring-1 ring-amber-300" />
              </div>
              {/* Nose & Smile */}
              <div className="absolute top-12 w-1.5 h-2 bg-amber-300/80 rounded-full" />
              <div className="absolute top-15 w-4 h-1 bg-rose-400 rounded-full" />
            </div>

            {/* White Mandarin Collar with Gold Insignia */}
            <div className="absolute bottom-16 w-14 h-8 bg-white border-b border-slate-200 rounded-t-lg z-20 flex justify-between px-1.5 items-center">
              <div className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-amber-600 shadow-sm" />
              <div className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-amber-600 shadow-sm" />
            </div>

            {/* White Official Uniform Jacket */}
            <div className="w-full h-24 bg-white relative rounded-t-2xl shadow-lg border-t-2 border-slate-100 z-10 flex flex-col items-center">
              {/* Epaulettes / Gold Shoulder Straps (อินทรธนู) */}
              <div className="absolute -top-1 left-1 w-8 h-4 bg-amber-400 border border-amber-600 rounded rotate-[-12deg] flex items-center justify-center shadow-sm">
                <div className="w-6 h-1 bg-amber-600 rounded" />
              </div>
              <div className="absolute -top-1 right-1 w-8 h-4 bg-amber-400 border border-amber-600 rounded rotate-[12deg] flex items-center justify-center shadow-sm">
                <div className="w-6 h-1 bg-amber-600 rounded" />
              </div>

              {/* Gold Center Buttons */}
              <div className="mt-3 flex flex-col gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
              </div>

              {/* Official Ribbon Bar (แพรแถบเครื่องราชอิสริยาภรณ์) */}
              <div className="absolute top-5 right-2 w-7 h-2.5 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-600 rounded-xs border border-slate-300 shadow-xs" />

              {/* Chest Pockets */}
              <div className="absolute top-9 left-2 w-6 h-4 border-t border-slate-300 rounded-b-xs" />
              <div className="absolute top-9 right-2 w-6 h-4 border-t border-slate-300 rounded-b-xs" />
            </div>
          </div>
        )}

        {allowUpload && (
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-2 text-center text-white text-xs">
            <Camera className="w-5 h-5 mb-1 text-amber-300 animate-bounce" />
            <span>เปลี่ยนรูปภาพ</span>
            <span className="text-[10px] text-slate-300">(คลิกเพื่อเลือกไฟล์)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {showBadge && (
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-1 rounded-full shadow-lg border-2 border-white">
          <ShieldCheck className="w-4 h-4 text-slate-900" />
        </div>
      )}
    </div>
  );
};
