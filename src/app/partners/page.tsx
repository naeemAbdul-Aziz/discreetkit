
import { redirect } from 'next/navigation';

export default function PartnersPage() {
  // This page is no longer in use and redirects to the homepage.
  redirect('/');
  return null;
}
