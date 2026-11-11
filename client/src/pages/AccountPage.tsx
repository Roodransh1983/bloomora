import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Package, Heart, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export function AccountPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.user.updateProfile({ name, phone });
      success('Profile details updated!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.user.changePassword({ currentPassword, newPassword });
      success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="border-b border-beige pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Patron Account</span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-1">Namaste, {user?.name}</h1>
          <p className="text-xs text-charcoal/60 mt-0.5">{user?.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/account/orders"
            className="px-4 py-2 rounded-xl border border-beige text-xs font-semibold text-forest hover:bg-ivory flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <Link
            to="/wishlist"
            className="px-4 py-2 rounded-xl border border-beige text-xs font-semibold text-terracotta hover:bg-ivory flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4" /> Saved Items
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="font-serif text-xl font-bold text-forest">Profile Information</h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <User className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 bg-beige/40 border border-beige rounded-xl text-xs text-charcoal/60 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <Phone className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
            >
              {savingProfile ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="font-serif text-xl font-bold text-forest">Security & Password</h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
