import { redirect } from 'next/navigation';

export default function AdminNotFound() {
  redirect('/admin/dashboard');
}
