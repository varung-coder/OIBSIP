import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiTrendingUp, FiShoppingBag, FiLayers } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Pizza Builder', path: '/builder' },
    { name: 'My Orders', path: '/orders' },
  ];

  if (!user) return null; // Hide navigation for unauthenticated users

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-200/40 bg-white/75 dark:border-slate-800/40 dark:bg-slate-950/75 backdrop-blur-premium transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-rose-400 text-white shadow-md shadow-rose-500/20">
                🍕
              </span>
              <span className="bg-gradient-to-r from-brand to-rose-400 bg-clip-text text-transparent">
                PizzaPilot
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand'
                      : 'text-slate-600 hover:text-brand hover:bg-slate-100/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Admin Link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-amber-600 hover:text-amber-500 hover:bg-amber-500/5 dark:text-amber-400'
                  }`}
                >
                  <FiLayers className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
            </div>

            {/* Middle divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Right widgets */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/50 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* User Avatar Card */}
              <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
                <div className="w-6 h-6 rounded-full bg-brand/20 dark:bg-brand/35 text-brand dark:text-brand text-xs font-bold flex items-center justify-center uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
                title="Log Out"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-white"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-brand hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white/95 dark:border-slate-800/50 dark:bg-slate-950/95 backdrop-blur-premium">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                  isActive(link.path)
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-brand dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold ${
                  isActive('/admin')
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'text-amber-600 hover:bg-amber-500/5 dark:text-amber-400'
                }`}
              >
                <FiLayers className="w-5 h-5" />
                Admin Console
              </Link>
            )}

            <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

            {/* Mobile Logout option */}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-rose-600 hover:bg-rose-500/5"
            >
              <FiLogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
