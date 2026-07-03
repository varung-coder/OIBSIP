import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiLock, FiLoader, FiCheckCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPasswordVal = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast('Reset token is missing in URL parameter.', 'error');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, data.password);
    setLoading(false);

    if (res.success) {
      toast('Password reset successfully!', 'success');
      setSuccess(true);
    } else {
      toast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/20 dark:bg-slate-950/20 relative">
      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5">
          <div className="text-center mb-8">
            <span className="inline-block text-4xl mb-3">🛡️</span>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Create New Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-semibold">
              Enter and confirm your new secure credentials
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <FiCheckCircle className="mx-auto w-16 h-16 text-emerald-500 animate-bounce" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                Your credentials have been successfully updated. You can now use your new password to sign in.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                      errors.password ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <span className="text-rose-500 text-xs font-semibold mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === newPasswordVal || 'Passwords do not match',
                    })}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                      errors.confirmPassword ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-rose-500 text-xs font-semibold mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-premium-hover active:scale-[0.98]"
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  'Reset My Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
