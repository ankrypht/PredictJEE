import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DbErrorProps {
  dbError: string;
}

export const DbError: React.FC<DbErrorProps> = ({ dbError }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[400px]">
      <div className="max-w-md space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-rose-500">Database Engine Error</h2>
        <p className="text-slate-500 dark:text-slate-400">{dbError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
};
