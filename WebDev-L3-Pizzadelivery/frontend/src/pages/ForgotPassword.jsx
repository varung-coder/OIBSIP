import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLoader, FiArrowLeft, FiSend, FiExternalLink } from 'react-icons/fi';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [successLink, setSuccessLink] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await forgotPassword(data.email);
    setLoading(false);

    if (res.success) {
      toast('If the account exists, a reset link was sent!', 'success');
      setSuccessLink(res.previewUrl || 'sent');
    } else {
      toast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/20 dark:bg-slate-950/20 relative">
      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <span className="inline-block text-4xl mb-3">🔑</span>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-semibold">
              Enter your email to receive a password reset link
            </p>
          </div>

          {successLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                  Password Reset Email Dispatched!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold leading-relaxed">
                  We have successfully generated a password recovery link. Please check your inbox for instructions.
                </p>
              </div>

              {/* Developer Inbox Preview */}
              {successLink !== 'sent' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Developer Mailbox Preview
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed font-semibold">
                    In development mode, you can inspect the sent verification mail instantly:
                  </p>
                  <a
                    href={successLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm animate-pulse"
                  >
                    Open Mailbox Preview <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: 'Invalid email syntax',
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                      errors.email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="pilot@example.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-rose-500 text-xs font-semibold mt-1.5 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-premium-hover active:scale-[0.98]"
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Recovery Link <FiSend className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
