import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileEdit,
  User,
  LogOut,
  Menu,
  Plus,
  TrendingUp,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProductsManagement from './ProductsManagement';
import CategoriesManagement from './CategoriesManagement';
import AdminProfile from './AdminProfile';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: Folder },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Content', href: '/admin/content', icon: FileEdit },
  { name: 'Profile', href: '/admin/profile', icon: User },
];

// Dashboard Overview
const AdminOverview = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground mt-1">
        Manage your store, products, and orders.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Products', value: '48', icon: Package, trend: '+12%' },
        { label: 'Total Orders', value: '156', icon: ShoppingCart, trend: '+8%' },
        { label: 'Total Customers', value: '89', icon: Users, trend: '+15%' },
        { label: 'Revenue', value: 'NPR 2.4M', icon: TrendingUp, trend: '+23%' },
      ].map((stat) => (
        <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <span className="text-xs text-accent font-medium">{stat.trend}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-foreground">Order #100{i}</p>
                <p className="text-sm text-muted-foreground">Rose Bouquet × 2</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                Processing
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <ShoppingCart className="h-5 w-5" />
            View Orders
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Users className="h-5 w-5" />
            Customers
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileEdit className="h-5 w-5" />
            Edit Content
          </Button>
        </div>
      </div>
    </div>
  </div>
);


// Orders Management
const OrdersManagement = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      Manage Orders
    </h1>
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <p className="text-muted-foreground text-center py-8">
        Order management interface coming soon!
      </p>
    </div>
  </div>
);

// Customers Management
const CustomersManagement = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      Manage Customers
    </h1>
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <p className="text-muted-foreground text-center py-8">
        Customer management interface coming soon!
      </p>
    </div>
  </div>
);

// Content Management
const ContentManagement = () => (
  <div className="space-y-6">
    <h1 className="font-serif text-3xl font-bold text-foreground">
      Content Management
    </h1>
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <p className="text-muted-foreground text-center py-8">
        Content management interface coming soon!
      </p>
    </div>
  </div>
);


const AdminDashboard = () => {
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
              <div>
                <span className="font-serif text-xl font-semibold text-foreground block">
                  Buneko Nepal
                </span>
                <span className="text-xs text-primary font-medium">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                (link.href === '/admin' && location.pathname === '/admin/');
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
                {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}: {user?.name || 'Admin'}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
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
              <Route index element={<AdminOverview />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="customers" element={<CustomersManagement />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="profile" element={<AdminProfile />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
