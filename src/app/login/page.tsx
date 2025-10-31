// src/app/login/page.tsx
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});


const LoginForm = () => {
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
    }
  };


  return (
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
  );
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Package2 className="h-8 w-8 mb-2" />
          <CardTitle className="text-2xl font-bold">Portal Login</CardTitle>
          <CardDescription>
            Admin & Pharmacy Access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
