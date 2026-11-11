import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Gift,
  Flower2,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Ticket,
  FileText,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Clothing Donations', href: '/admin/donations', icon: Gift },
    { label: 'Flower Collections', href: '/admin/flowers', icon: Flower2 },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Website CMS', href: '/admin/content', icon: FileText },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest text-ivory/80 border-r border-forest-light shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-forest-light/60 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sage/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C8 6 6 9 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 9 16 6 12 2Z"
                  fill="#87977A"
                />
                <circle cx="12" cy="12" r="2.5" fill="#F8F5EC" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-ivory block leading-none">
                BLOOMORA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-sage font-sans">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-sage text-forest font-semibold shadow-sm'
                    : 'text-ivory/70 hover:bg-forest-light hover:text-ivory'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-forest' : 'text-ivory/60'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-forest-light/60 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-ivory/70 hover:bg-forest-light hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-beige/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-charcoal/70 hover:bg-beige/40"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-charcoal font-sans hidden sm:block">
              {menuItems.find((i) => i.href === location.pathname)?.label || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-charcoal">{user?.name}</p>
              <p className="text-[10px] text-charcoal/50">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-forest text-ivory text-xs font-bold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-forest text-ivory flex flex-col h-full z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-forest-light">
              <span className="font-serif font-bold text-lg">BLOOMORA</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-forest-light"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-300 py-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
