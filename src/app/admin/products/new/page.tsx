/**
 * @file page.tsx
 * @description Page for creating a new product in the admin dashboard.
 */

import { ProductForm } from '../(components)/product-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NewProductPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>
                        Fill out the form below to add a new product to your inventory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm />
                </CardContent>
            </Card>
        </div>
    )
}
