import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image_url?: string | null;
}

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.getProductById(Number(id));
        if (response.success && response.data) {
          setProduct(response.data.product);
        } else {
          toast.error(response.message || 'Product not found');
          navigate('/products', { replace: true });
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        toast.error(error.message || 'Failed to load product');
        navigate('/products', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    const numericPrice = Number(product.price);
    const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: safePrice,
        image_url: product.image_url,
      },
      quantity
    );
    toast.success('Added to cart');
  };

  const formattedPrice = () => {
    if (!product) return '';
    const n = Number(product.price);
    return Number.isFinite(n) ? `NPR ${n.toFixed(2)}` : `NPR ${product.price}`;
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {loading || !product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Skeleton className="w-full aspect-square rounded-3xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-card rounded-3xl overflow-hidden shadow-card">
                <div className="relative aspect-square">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                    {product.name}
                  </h1>
                  <p className="text-primary text-xl font-semibold">
                    {formattedPrice()}
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border text-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border text-lg"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    className="rounded-xl"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetailsPage;


