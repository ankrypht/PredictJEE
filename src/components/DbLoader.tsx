import React from 'react';
import { GraduationCap } from 'lucide-react';

interface DbLoaderProps {
  dbProgress: number;
}

export const DbLoader: React.FC<DbLoaderProps> = ({ dbProgress }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 min-h-[400px]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-brand-500/10 text-brand-400 rounded-3xl animate-bounce">
          <GraduationCap className="h-10 w-10 text-brand-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Initializing Database Engine</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            We are loading the 30 MB historical cutoff database directly to your browser. This download runs only once.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-600 to-amber-500 transition-all duration-300"
              style={{ width: `${dbProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Downloading cutoffs.db</span>
            <span>{dbProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
