import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUser, FiMail, FiLock, FiLoader, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

const Register = () => {
  const { register: registerAction } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerAction(data.name, data.email, data.password);
    setLoading(false);

    if (result && result.success) {
      toast(result.message, 'success');
      setSuccessData({
        email: data.email,
        previewUrl: result.previewUrl,
      });
    } else {
      toast(result?.message || 'Registration failed.', 'error');
    }
  };

  if (successData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/20 dark:bg-slate-950/20 relative">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 text-center">
          <FiCheckCircle className="mx-auto w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Registration Successful!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-semibold leading-relaxed">
            We have sent a verification email to <span className="text-brand">{successData.email}</span>.
            Please verify your email address to log in.
          </p>

          {/* Test Sandbox Mail Link */}
          {successData.previewUrl && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
              <h3 className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                Developer Ethereal Inbox Link
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed font-semibold">
                Since this is running in test mode, you can view the sent email instantly by clicking the link below:
              </p>
              <a
                href={successData.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm"
              >
                Open Ethereal Mail Sandbox <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5">
          <div className="text-center mb-8">
            <span className="inline-block text-4xl mb-3 animate-float">✈️</span>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-semibold">
              Get started with PizzaPilot platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  {...register('name', { required: 'Full name is required' })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                    errors.name ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="e.g. Captain America"
                />
              </div>
              {errors.name && (
                <span className="text-rose-500 text-xs font-semibold mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                      message: 'Invalid email format',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                    errors.email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="e.g. captain@example.com"
                />
              </div>
              {errors.email && (
                <span className="text-rose-500 text-xs font-semibold mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
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
                    validate: (value) => value === passwordVal || 'Passwords do not match',
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
                'Verify Email & Register'
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-brand hover:text-brand-hover hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
