import { useEffect, useState } from 'react';
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
import { api } from '@/lib/api';
import { toast } from 'sonner';

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

// Products Page (dynamic)
const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, wishlistRes] = await Promise.all([
        api.getProducts({ page: 1, limit: 12 }),
        api.getWishlist(),
      ]);
      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products || []);
      }
      if (wishlistRes.success && wishlistRes.data) {
        setWishlist((wishlistRes.data.items || []).map((i: any) => i.product_id));
      }
    } catch (error: any) {
      console.error('Error loading dashboard products:', error);
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleWishlist = async (productId: number) => {
    try {
      if (wishlist.includes(productId)) {
        await api.removeFromWishlist(productId);
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await api.addToWishlist(productId);
        setWishlist((prev) => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Wishlist update error:', error);
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Browse Products
      </h1>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl p-4 shadow-soft flex flex-col"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <h2 className="font-medium text-foreground line-clamp-2 mb-1">
                {product.name}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {product.description}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-primary font-semibold text-sm">
                  {(() => {
                    const n = Number(product.price);
                    return Number.isFinite(n)
                      ? `NPR ${n.toFixed(2)}`
                      : `NPR ${product.price}`;
                  })()}
                </span>
                <Button
                  variant={wishlist.includes(product.id) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {wishlist.includes(product.id) ? 'Wishlisted' : 'Wishlist'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Orders Page (dynamic)
const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getUserOrders();
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
        }
      } catch (error: any) {
        console.error('Error loading orders:', error);
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        My Orders
      </h1>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Order #{order.id}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Total: NPR {Number(order.total_amount).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Wishlist Page (dynamic)
const WishlistPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.getWishlist();
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      toast.error(error.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const remove = async (productId: number) => {
    try {
      await api.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        My Wishlist
      </h1>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading wishlist...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-card rounded-2xl p-4 shadow-soft flex flex-col"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <h2 className="font-medium text-foreground line-clamp-2 mb-1">
                {item.name}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
              <span className="text-primary font-semibold text-sm mb-3">
                {(() => {
                  const n = Number(item.price);
                  return Number.isFinite(n)
                    ? `NPR ${n.toFixed(2)}`
                    : `NPR ${item.price}`;
                })()}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto rounded-full text-xs"
                onClick={() => remove(item.product_id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
