import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiArrowRight, FiLoader } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result && result.success) {
      toast('Login successful! Welcome back.', 'success');
      navigate('/');
    } else {
      toast(result?.message || 'Invalid email or password.', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 relative">
          <div className="text-center mb-8">
            <span className="inline-block text-4xl mb-3 animate-float">🍕</span>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
              Sign In to PizzaPilot
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-semibold">
              Enter your credentials to manage your pizza orders
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
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
                      message: 'Invalid email address syntax',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                    errors.email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="e.g. pilot@example.com"
                />
              </div>
              {errors.email && (
                <span className="text-rose-500 text-xs font-semibold mt-1.5 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-brand hover:text-brand-hover dark:text-brand transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm font-medium ${
                    errors.password ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <span className="text-rose-500 text-xs font-semibold mt-1.5 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-brand focus:ring-brand accent-brand"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
                Remember my login session
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-premium-hover active:scale-[0.98]"
            >
              {loading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Sign In <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-brand hover:text-brand-hover hover:underline transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
