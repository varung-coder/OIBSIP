import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing in the query URL.');
        return;
      }

      const res = await verifyEmail(token, email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    };

    performVerification();
  }, [token, email]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/20 dark:bg-slate-950/20 relative">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <FiLoader className="mx-auto w-12 h-12 text-brand animate-spin" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Activating Account...
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Please wait while we verify your activation token with PizzaPilot servers.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <FiCheckCircle className="mx-auto w-16 h-16 text-emerald-500 animate-bounce" />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Account Activated!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {message || 'Your email address has been successfully verified.'}
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <FiXCircle className="mx-auto w-16 h-16 text-rose-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Activation Failed
            </h1>
            <p className="text-sm text-rose-500 dark:text-rose-400 font-semibold leading-relaxed">
              {message || 'The verification link is invalid or has expired.'}
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Link
                to="/register"
                className="inline-block px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
              >
                Create New Account
              </Link>
              <Link
                to="/login"
                className="text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
