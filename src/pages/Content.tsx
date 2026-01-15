import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, RefreshCw } from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  url: string;
  platform: string;
  created_at: string;
}

const ContentPage = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadContents = async () => {
    try {
      setLoading(true);
      const response = await api.getContents({ page, limit: 9 });

      if (response.success && response.data) {
        setContents(response.data.contents || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages || 1);
        }
      }
    } catch (error: any) {
      console.error('Error loading contents:', error);
      toast.error(error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getTikTokEmbedUrl = (url: string) => {
    // Basic handling: if it's a TikTok share URL, just use it in an iframe
    return url;
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Social Content
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">
                TikTok Videos
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Watch our latest TikTok content featuring Buneko Nepal handmade
                flowers and arrangements.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl self-start"
              onClick={loadContents}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Content grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <Skeleton className="w-full aspect-[9/16] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-16">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-60" />
              <p className="text-muted-foreground">
                No TikTok content has been added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl shadow-soft overflow-hidden flex flex-col"
                >
                  <div className="relative w-full aspect-[9/16] bg-black">
                    <iframe
                      src={getTikTokEmbedUrl(item.url)}
                      title={item.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-serif text-base font-semibold text-foreground line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-10">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ContentPage;


