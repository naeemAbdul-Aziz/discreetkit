'use client';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full h-12 text-base font-medium rounded-full" disabled={pending}>
            {pending ? "Signing In..." : "Sign In"}
            {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
    );
};

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <form action={login} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@example.com" 
            className="pl-10 h-12 bg-background border-input/50 focus:border-primary/50 transition-all rounded-xl"
            required 
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
            <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••"
            className="pl-10 pr-10 h-12 bg-background border-input/50 focus:border-primary/50 transition-all rounded-xl"
            required 
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Visual & Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <Image 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                alt="Abstract Background"
                fill
                className="object-cover opacity-40"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
             <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <div className="h-4 w-4 rounded-full bg-white" />
                </div>
                <span className="font-headline text-xl font-bold tracking-tight">DiscreetKit</span>
             </Link>
        </div>

        {/* Testimonial / Brand Statement */}
        <div className="relative z-10 max-w-lg">
            <blockquote className="space-y-6">
                <p className="text-3xl font-medium leading-tight">
                    "Healthcare should be accessible, private, and dignified. We're building the future of discreet wellness."
                </p>
                <footer className="text-sm text-white/60">
                    &copy; 2024 DiscreetKit Inc.
                </footer>
            </blockquote>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">Enter your credentials to access your account.</p>
            </div>

            <LoginForm />

            <div className="text-center text-sm text-muted-foreground mt-8">
                <Link href="/" className="hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to website
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
