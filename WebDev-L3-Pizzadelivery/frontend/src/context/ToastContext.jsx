import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertOctagon } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Stack portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgColor = 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100';
            let icon = <FiInfo className="text-sky-500 w-5 h-5" />;
            let borderColor = 'border-sky-500/20';

            if (t.type === 'success') {
              bgColor = 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100';
              borderColor = 'border-emerald-500/30';
              icon = <FiCheckCircle className="text-emerald-500 w-5 h-5" />;
            } else if (t.type === 'error') {
              bgColor = 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
              borderColor = 'border-rose-500/30';
              icon = <FiAlertOctagon className="text-rose-500 w-5 h-5" />;
            } else if (t.type === 'warning') {
              bgColor = 'bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
              borderColor = 'border-amber-500/30';
              icon = <FiAlertTriangle className="text-amber-500 w-5 h-5" />;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, x: 100 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-premium shadow-glass ${bgColor} ${borderColor}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow text-sm font-medium leading-5">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
