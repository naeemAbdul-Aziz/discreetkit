import { redirect } from 'next/navigation';

export default function PharmacyNotFound() {
  redirect('/pharmacy/dashboard');
}
