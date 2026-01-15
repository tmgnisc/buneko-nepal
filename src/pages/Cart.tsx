import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const formattedTotal = Number.isFinite(totalPrice)
    ? `NPR ${totalPrice.toFixed(2)}`
    : `NPR ${totalPrice}`;

  const buildOrderItems = () =>
    items.map((item) => ({ product_id: item.id, quantity: item.quantity }));

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
      const response = await api.createCheckoutSession({
        items: buildOrderItems(),
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
                {/* Shipping form */}
                <div className="space-y-2">
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


