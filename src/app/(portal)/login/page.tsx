/**
 * @file src/app/(portal)/login/page.tsx
 * @description This page provides the unified login interface for all portal users
 *              (Admins, Pharmacy staff, etc.). It uses Supabase for
 *              email/password authentication and will handle role-based redirection.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Package2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError(null);
    const supabase = getSupabaseClient();
    const { error: signInError, data } = await supabase.auth.signInWithPassword(values);

    if (signInError) {
      setError(signInError.message);
    } else if (data.user) {
        // --- Role-Based Redirect Logic (Placeholder) ---
        // In the next step, we will query the 'profiles' table to get the user's role.
        // const { data: profile, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('role')
        //   .eq('id', data.user.id)
        //   .single();
        
        // let role = profile?.role || 'admin'; // Default to admin for now

        // For now, we'll just redirect to the admin dashboard.
        const role = 'admin'; 
        
        toast({
            title: 'Login Successful',
            description: `Redirecting to ${role} dashboard...`,
        });

        if (role === 'pharmacy') {
            router.push('/pharmacy/dashboard');
        } else {
            router.push('/admin/dashboard');
        }
        router.refresh(); // Ensure the layout re-evaluates auth state
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2 text-foreground">
        <Package2 className="h-8 w-8" />
        <h1 className="text-2xl font-semibold">DiscreetKit Portal</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="staff@discreetkit.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                    </>
                ) : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
