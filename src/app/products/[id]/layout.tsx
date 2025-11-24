// app/products/[id]/layout.tsx
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

async function getProduct(id: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }
    return {
      ...data,
      price_ghs: Number(data.price_ghs),
      student_price_ghs: data.student_price_ghs ? Number(data.student_price_ghs) : null,
    };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return generateSEOMetadata({
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
      url: `/products/${id}`,
    });
  }

  const keywords = [
    product.name,
    product.category || 'Health Products',
    'Ghana delivery',
    'confidential',
    'discreet',
    ...(product.name.toLowerCase().includes('hiv') ? ['HIV test', 'rapid test', 'self-test'] : []),
    ...(product.name.toLowerCase().includes('pregnancy') ? ['pregnancy test', 'early detection'] : []),
    ...(product.name.toLowerCase().includes('postpill') ? ['emergency contraception', 'morning after'] : []),
  ].filter(Boolean) as string[];

  return generateSEOMetadata({
    title: `${product.name} - Confidential Delivery in Ghana`,
    description: `${product.description || product.name} Order discreetly with fast delivery across Ghana. 100% confidential and anonymous service.`,
    keywords,
    url: `/products/${id}`,
    type: 'website',
    price: product.price_ghs.toString(),
    currency: 'GHS',
    availability: (product.stock_level && product.stock_level > 0) ? 'InStock' : 'OutOfStock',
    image: product.image_url || 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
  });
}

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return <>{children}</>;
  }

  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description || product.name,
    image: product.image_url || 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
    price: product.price_ghs.toString(),
    currency: 'GHS',
    availability: (product.stock_level && product.stock_level > 0) ? 'InStock' : 'OutOfStock',
    category: product.category || 'Health Products',
    sku: `DK-${product.id}`,
    brand: 'DiscreetKit Ghana',
  });

  const categoryPath = product.category 
    ? product.category.toLowerCase().replace(/\s+/g, '-')
    : 'health-products';

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category || 'Health Products', url: `/products/${categoryPath}` },
    { name: product.name, url: `/products/${product.id}` }
  ]);

  return (
    <>
      <StructuredData data={[productSchema, breadcrumbSchema]} includeDefaults={false} />
      {children}
    </>
  );
}