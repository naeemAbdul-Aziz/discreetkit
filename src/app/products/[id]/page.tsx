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
      savings_ghs: data.savings_ghs ? Number(data.savings_ghs) : null,
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
        if (p.id === 1) { // HIV Test
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        }
        if (p.id === 2) { // Pregnancy Test
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        }
        if (p.id === 3) { // Couple Bundle
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407003/couple_cxwfer.png';
        }
        if (p.id === 4) { // Postpill
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
        }
        if (p.id === 8) { // All-in-one
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        }
        return {
            ...p,
            image_url: imageUrl,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
            savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
        };
    });
}


export default async function ProductDetailPageWrapper({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  // Override image for the main product being viewed
  if (product.id === 1) { // HIV Test
    product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
  }
  if (product.id === 2) { // Pregnancy Test
    product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
  }
  if (product.id === 3) { // Couple Bundle
      product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407003/couple_cxwfer.png';
  }
  if (product.id === 4) { // Postpill
    product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
  }
  if (product.id === 8) { // All-in-one
    product.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
  }

  const relatedProducts = await getRelatedProducts(product.id);

  return <ProductDetailContent product={product} relatedProducts={relatedProducts} />;
}
