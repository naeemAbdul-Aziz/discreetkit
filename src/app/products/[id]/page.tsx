
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailContent } from './(components)/product-detail-content';

// This function fetches the data for a single product.
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

// This function fetches related products, excluding the current one.
async function getRelatedProducts(currentProductId: number): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('id', 'eq', currentProductId)
        .limit(4);

    if (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
    // Map over related products to update images and cast numeric types
    return data.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 1) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 3) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 4) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
        if (p.id === 5) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 6) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 7) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
        if (p.id === 8) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        if (p.id === 9) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 10) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 11) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 12) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 13) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
        if (p.id === 14) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 15) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        
        return {
            ...p,
            image_url: imageUrl,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
        };
    });
}


export default async function ProductDetailPageWrapper({ params }: { params: { id: string } }) {
  // The wellness page products are not in the DB, so we must check for them separately.
  const isWellnessProduct = [4, 5, 6, 9, 10, 11, 12, 13, 16, 17, 18].includes(Number(params.id));
  let product: Product | null;

  if (isWellnessProduct) {
      const wellnessProducts = (await import('../wellness/page')).default.wellnessProducts;
      product = wellnessProducts.find(p => p.id === Number(params.id)) || null;
  } else {
      product = await getProduct(params.id);
  }
  
  if (!product) {
    notFound();
  }

  // Override image for the main product being viewed
    if (product.id === 1) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
    if (product.id === 2) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
    if (product.id === 3) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
    if (product.id === 7) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
    if (product.id === 8) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
    if (product.id === 14) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
    if (product.id === 15) product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';

  const relatedProducts = await getRelatedProducts(product.id);

  return <ProductDetailContent product={product} relatedProducts={relatedProducts} />;
}
