import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { LoginModal } from '../auth/LoginModal';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Donate Clothes', href: '/donate' },
    { label: 'Give Flowers', href: '/flowers' },
    { label: 'Track Request', href: '/track' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-ivory/95 backdrop-blur-md shadow-sm border-b border-beige/60 py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-forest text-ivory flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C8 6 6 9 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 9 16 6 12 2Z"
                    fill="#87977A"
                    opacity="0.8"
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
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-forest leading-none">
                  BLOOMORA
                </span>
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-sans mt-0.5">
                  Beauty Beyond Waste
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-sans transition-colors relative py-1 ${
                    isActive(link.href)
                      ? 'text-forest font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-forest after:rounded-full'
                      : 'text-charcoal/80 hover:text-forest'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search dried floral art, hampers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="text-xs bg-white border border-beige rounded-full py-1.5 pl-3 pr-8 w-48 sm:w-64 focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2 text-charcoal/50 hover:text-charcoal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-charcoal/70 hover:text-forest rounded-full hover:bg-beige/40 transition-colors"
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-charcoal/70 hover:text-forest rounded-full hover:bg-beige/40 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-charcoal/70 hover:text-forest rounded-full hover:bg-beige/40 transition-colors"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest text-ivory text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full border border-beige bg-white/70 hover:bg-white text-xs font-medium text-forest transition-colors">
                    <User className="w-4 h-4 text-forest" />
                    <span className="hidden sm:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-beige py-2 hidden group-hover:block transition-all z-50">
                    <div className="px-4 py-2 border-b border-beige/60">
                      <p className="text-xs font-semibold text-charcoal truncate">{user.name}</p>
                      <p className="text-[11px] text-charcoal/60 truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-forest font-semibold hover:bg-ivory"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/account" className="block px-4 py-2 text-xs text-charcoal/80 hover:bg-ivory">
                      My Profile
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-xs text-charcoal/80 hover:bg-ivory">
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-xs text-charcoal/80 hover:bg-ivory">
                      Saved Items
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-beige/40 mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest text-ivory text-xs font-medium hover:bg-forest-light transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-charcoal/80 hover:text-forest"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ivory border-b border-beige px-6 py-5 shadow-xl transition-all">
            <nav className="flex flex-col gap-3.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-sans py-1 ${
                    isActive(link.href) ? 'text-forest font-semibold' : 'text-charcoal/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="mt-2 w-full py-2.5 rounded-full bg-forest text-ivory text-sm font-medium text-center"
                >
                  Sign In / Register
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
