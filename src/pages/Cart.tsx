import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

interface LocationSelectorProps {
  onChange: (lat: number, lng: number) => void;
}

const LocationSelector = ({ onChange }: LocationSelectorProps) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const formattedTotal = Number.isFinite(totalPrice)
    ? `NPR ${totalPrice.toFixed(2)}`
    : `NPR ${totalPrice}`;

  const buildOrderItems = () =>
    items.map((item) => ({ product_id: item.id, quantity: item.quantity }));

  // Handle return from Stripe (card payment)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      const stored = localStorage.getItem('pending_card_order');
      if (!stored) {
        console.warn('No pending order data found after Stripe payment success');
        // Clean URL anyway
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      let payload: {
        items: Array<{ product_id: number; quantity: number }>;
        shipping_address: string;
        phone: string;
        notes?: string;
        latitude?: number | null;
        longitude?: number | null;
      };

      try {
        payload = JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing pending order data:', error);
        localStorage.removeItem('pending_card_order');
        window.history.replaceState({}, '', window.location.pathname);
        toast.error('Failed to process order data. Please contact support.');
        return;
      }

      // Remove stored data immediately to prevent duplicate order creation
      localStorage.removeItem('pending_card_order');
      // Clean query param from URL
      window.history.replaceState({}, '', window.location.pathname);

      const createPaidOrder = async () => {
        try {
          setIsPlacingOrder(true);
          console.log('Creating order after Stripe payment:', payload);
          const response = await api.createOrder({
            ...payload,
            payment_status: 'paid',
          });
          
          if (response.success) {
            toast.success('Order placed successfully! Payment received.');
            clearCart();
          } else {
            throw new Error(response.message || 'Failed to create order');
          }
        } catch (error: any) {
          console.error('Error creating order after payment:', error);
          toast.error(error.message || 'Failed to save order after payment. Please contact support.');
          // Re-store the payload so user can retry if needed
          localStorage.setItem('pending_card_order', JSON.stringify(payload));
        } finally {
          setIsPlacingOrder(false);
        }
      };

      createPaidOrder();
    } else if (paymentStatus === 'cancelled') {
      // Clean URL and inform user
      window.history.replaceState({}, '', window.location.pathname);
      toast.error('Payment was cancelled.');
      // Optionally remove pending order data on cancel
      localStorage.removeItem('pending_card_order');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrderCOD = async () => {
    if (!shippingAddress.trim() || !phone.trim()) {
      toast.error('Please enter shipping address and phone number.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      await api.createOrder({
        items: buildOrderItems(),
        shipping_address: shippingAddress.trim(),
        phone: phone.trim(),
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Order placed successfully (Cash on Delivery).');
      clearCart();
    } catch (error: any) {
      console.error('Error placing COD order:', error);
      toast.error(error.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!shippingAddress.trim() || !phone.trim()) {
      toast.error('Please enter shipping address and phone number.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const frontendUrl = window.location.origin;
      // Persist order details so we can create the order after successful payment
      const pendingPayload = {
        items: buildOrderItems(),
        shipping_address: shippingAddress.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      };
      localStorage.setItem('pending_card_order', JSON.stringify(pendingPayload));
      const response = await api.createCheckoutSession({
        items: pendingPayload.items,
        successUrl: `${frontendUrl}/cart?payment=success`,
        cancelUrl: `${frontendUrl}/cart?payment=cancelled`,
      });
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.message || 'Failed to start checkout.');
      }
    } catch (error: any) {
      console.error('Error creating Stripe checkout session:', error);
      toast.error(error.message || 'Failed to start card payment.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalItems > 0
                  ? `You have ${totalItems} item${totalItems > 1 ? 's' : ''} in your cart.`
                  : 'Your cart is empty.'}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-60" />
              <p className="text-muted-foreground mb-4">
                Your cart is empty. Add some products to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-2xl p-4 flex gap-4 items-center shadow-soft"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h2 className="font-medium text-foreground line-clamp-2">
                        {item.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        NPR {item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-full border border-border text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-full border border-border text-sm"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-soft h-fit space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Order Summary
                </h2>
                {/* Payment method */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Payment method</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span>Online Card Payment (Stripe)</span>
                    </label>
                  </div>
                </div>
                {/* Shipping form + map */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Shipping details</p>
                  <textarea
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Tap on the map to set your delivery location. This will be sent to the
                      admin with your order.
                    </p>
                    <div className="w-full h-64 rounded-xl overflow-hidden border border-border">
                      <MapContainer
                        center={[27.7172, 85.3240]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationSelector
                          onChange={(lat, lng) => {
                            setLatitude(lat);
                            setLongitude(lng);
                          }}
                        />
                        {latitude !== null && longitude !== null && (
                          <Marker position={[latitude, longitude]} icon={markerIcon} />
                        )}
                      </MapContainer>
                    </div>
                    {latitude !== null && longitude !== null && (
                      <p className="text-xs text-muted-foreground">
                        Selected location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Items</span>
                  <span className="text-sm font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-base font-semibold text-primary">
                    {formattedTotal}
                  </span>
                </div>
                <Button
                  className="w-full rounded-xl"
                  disabled={isPlacingOrder}
                  onClick={paymentMethod === 'cod' ? handlePlaceOrderCOD : handleStripeCheckout}
                >
                  {isPlacingOrder
                    ? 'Processing...'
                    : paymentMethod === 'cod'
                    ? 'Place Order (Cash on Delivery)'
                    : 'Pay with Card (Stripe)'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CartPage;


