import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Instagram, Facebook, Twitter, Phone, MapPin, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.newsletter.subscribe(email);
      success('Thank you for subscribing to the BLOOMORA journal!');
      setEmail('');
    } catch (err: any) {
      error(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-forest text-ivory/80 pt-16 pb-8 border-t border-forest-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <div className="w-9 h-9 rounded-full bg-sage/30 text-ivory flex items-center justify-center">
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
              <span className="font-serif text-2xl font-bold tracking-tight text-ivory">BLOOMORA</span>
            </Link>
            <p className="text-sm font-sans text-ivory/70 leading-relaxed max-w-sm mb-6">
              Beauty Beyond Waste. Giving discarded temple & wedding flowers a second bloom, and unused garments a new life. Crafted with care in India.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage hover:text-forest transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage hover:text-forest transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage hover:text-forest transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-ivory mb-4 font-sans">
              Initiatives
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/flowers" className="hover:text-ivory transition-colors">
                  Flower Upcycling
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-ivory transition-colors">
                  Clothing Donation
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-ivory transition-colors">
                  Track Donation / Request
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-ivory transition-colors">
                  Artisanal Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-ivory transition-colors">
                  Our Impact & Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-ivory mb-4 font-sans">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop?category=dried-flower-decorations" className="hover:text-ivory transition-colors">
                  Dried Flower Decor
                </Link>
              </li>
              <li>
                <Link to="/shop?category=handmade-floral-art" className="hover:text-ivory transition-colors">
                  Handmade Floral Art
                </Link>
              </li>
              <li>
                <Link to="/shop?category=eco-friendly-home-decor" className="hover:text-ivory transition-colors">
                  Eco Home Decor
                </Link>
              </li>
              <li>
                <Link to="/shop?category=upcycled-textile-products" className="hover:text-ivory transition-colors">
                  Upcycled Textiles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gift-hampers" className="hover:text-ivory transition-colors">
                  Curated Hampers
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-ivory mb-4 font-sans">
              The Bloom Journal
            </h4>
            <p className="text-xs text-ivory/70 leading-relaxed mb-4">
              Receive updates on seasonal botanical creations, donation drives, and sustainability stories.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 text-ivory placeholder-ivory/40 text-xs px-3.5 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:border-sage"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage text-forest font-semibold text-xs py-2.5 rounded-xl hover:bg-sage-light transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60 font-sans">
          <p>© {new Date().getFullYear()} BLOOMORA Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-ivory">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-ivory">
              Terms of Service
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              Handcrafted in India with <Heart className="w-3 h-3 text-terracotta fill-terracotta" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
