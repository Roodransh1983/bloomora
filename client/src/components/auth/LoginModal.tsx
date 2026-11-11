import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, phone);
        success('Account created successfully! Welcome to BLOOMORA.');
      } else {
        await login(email, password);
        success('Welcome back to BLOOMORA!');
      }
      onClose();
    } catch (err: any) {
      error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@bloomora.in');
    setPassword('adminpassword123');
    setIsRegister(false);
  };

  const fillDemoUser = () => {
    setEmail('user@bloomora.in');
    setPassword('userpassword123');
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ivory rounded-3xl shadow-2xl border border-beige p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal hover:bg-beige/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8 6 6 9 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 9 16 6 12 2Z"
                fill="#87977A"
              />
              <path
                d="M12 18V22M8 20L12 18L16 20"
                stroke="#F8F5EC"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="#F8F5EC" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest">
            {isRegister ? 'Join the Movement' : 'Welcome to BLOOMORA'}
          </h2>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            {isRegister
              ? 'Create an account to track donations and shop sustainably.'
              : 'Sign in to access your orders, donations, and saved floral art.'}
          </p>
        </div>

        {/* Demo Credential Quick-Pill Helper */}
        <div className="mb-5 p-3 rounded-2xl bg-white border border-beige/80 text-xs">
          <p className="font-semibold text-forest flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sage" /> Quick Demo Credentials
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1 px-2 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-[11px] font-medium transition-colors"
            >
              Fill Admin (admin@bloomora.in)
            </button>
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1 px-2 rounded-lg bg-sage/20 hover:bg-sage/30 text-forest text-[11px] font-medium transition-colors"
            >
              Fill User (user@bloomora.in)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Menon"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal/70 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
              />
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <Phone className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal/70 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
              />
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-charcoal/60">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-forest font-semibold underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-forest font-semibold underline"
              >
                Register Here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
