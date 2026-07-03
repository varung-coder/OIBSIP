import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/5 blur-3xl" />
      
      <span className="text-7xl mb-6 animate-float select-none">🛸🍕</span>
      <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight font-sans">
        404 - Pizza Abducted!
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed font-semibold">
        The page you are looking for has been taken off course. Let's redirect you back to the dashboard console.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 duration-200"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
