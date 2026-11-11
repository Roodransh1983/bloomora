import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DonatePage } from './pages/DonatePage';
import { FlowerPage } from './pages/FlowerPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AccountOrdersPage } from './pages/AccountOrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { TrackingPage } from './pages/TrackingPage';

// Admin
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDonations } from './pages/admin/AdminDonations';
import { AdminFlowers } from './pages/admin/AdminFlowers';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminSettings } from './pages/admin/AdminSettings';

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans selection:bg-sage/30 selection:text-forest">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Routes>
                {/* Store Front Routes */}
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:slug" element={<ProductDetailPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/flowers" element={<FlowerPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<AccountOrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/track" element={<TrackingPage />} />
                  <Route path="/track/:type/:number" element={<TrackingPage />} />
                </Route>

                {/* Admin Console Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="donations" element={<AdminDonations />} />
                    <Route path="flowers" element={<AdminFlowers />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<StoreLayout />}>
                  <Route path="*" element={<HomePage />} />
                </Route>
              </Routes>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
