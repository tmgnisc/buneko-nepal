import { useEffect, useState } from 'react';
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
import { api } from '@/lib/api';
import { toast } from 'sonner';
import ProductsManagement from './ProductsManagement';
import CategoriesManagement from './CategoriesManagement';
import AdminProfile from './AdminProfile';
import CustomersManagement from './CustomersManagement';
import ContentManagement from './ContentManagement';

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


// Orders Management (dynamic)
const OrdersManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({
        page: 1,
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (
    orderId: number,
    newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success('Order status updated');
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatAmount = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? `NPR ${n.toFixed(2)}` : `NPR ${value}`;
  };

  const formatDate = (value: string) =>
    value ? new Date(value).toLocaleString() : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Manage Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all customer orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border bg-background text-sm rounded-xl px-3 py-1.5"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No orders found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Payment</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 align-top"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      #{order.id}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.user_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {order.phone}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {order.shipping_address}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span className="font-semibold text-foreground">
                        {formatAmount(order.total_amount)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.payment_status === 'failed'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'cancelled'
                            ? 'bg-destructive/10 text-destructive'
                            : order.status === 'processing'
                            ? 'bg-sky-100 text-sky-700'
                            : order.status === 'shipped'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {order.items && order.items.length > 0 ? (
                        <ul className="space-y-1 max-w-[220px]">
                          {order.items.map((item: any) => (
                            <li key={item.id} className="flex justify-between gap-2">
                              <span className="truncate">
                                {item.product_name || `Product #${item.product_id}`}
                              </span>
                              <span className="shrink-0">
                                × {item.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No items
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as
                              | 'pending'
                              | 'processing'
                              | 'shipped'
                              | 'delivered'
                              | 'cancelled'
                          )
                        }
                        className="border border-border bg-background text-xs rounded-xl px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


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
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.name || 'Admin'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary-foreground" />
                )}
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
