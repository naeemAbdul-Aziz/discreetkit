/**
 * @file src/app/(dashboard)/admin/products/page.tsx
 * @description Placeholder page for the Admin Products section.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminProductsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Add, edit, and manage your product inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Product management content will be implemented here.</p>
      </CardContent>
    </Card>
  );
}