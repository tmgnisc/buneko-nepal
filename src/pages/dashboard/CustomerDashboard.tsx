import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Heart,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Browse Products', href: '/dashboard/products', icon: ShoppingBag },
  { name: 'My Orders', href: '/dashboard/orders', icon: Package },
  { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

// Dashboard Overview Component
const DashboardOverview = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Welcome Back!
      </h1>
      <p className="text-muted-foreground mt-1">
        Manage your orders and explore our handmade collection.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Total Orders', value: '12', icon: Package },
        { label: 'Wishlist Items', value: '5', icon: Heart },
        { label: 'Active Orders', value: '2', icon: ShoppingBag },
      ].map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
        Recent Orders
      </h2>
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No orders yet. Start shopping!</p>
        <Link to="/services">
          <Button className="mt-4">Browse Products</Button>
        </Link>
      </div>
    </div>
  </div>
);

// Products Page
const ProductsPage = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      Browse Products
    </h1>
    <div className="text-center py-12 text-muted-foreground">
      <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>Product catalog coming soon!</p>
    </div>
  </div>
);

// Orders Page
const OrdersPage = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      My Orders
    </h1>
    <div className="text-center py-12 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No orders found.</p>
    </div>
  </div>
);

// Wishlist Page
const WishlistPage = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      My Wishlist
    </h1>
    <div className="text-center py-12 text-muted-foreground">
      <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>Your wishlist is empty.</p>
    </div>
  </div>
);

// Profile Page
const ProfilePage = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      Profile Settings
    </h1>
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <p className="text-muted-foreground">Profile settings coming soon!</p>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Buneko Nepal" className="h-8 w-8 object-contain" />
              <span className="font-serif text-xl font-semibold text-foreground">
                Buneko Nepal
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                (link.href === '/dashboard' && location.pathname === '/dashboard/');
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || 'Customer'}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
