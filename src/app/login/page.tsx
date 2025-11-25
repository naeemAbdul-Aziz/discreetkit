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
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full h-11" disabled={pending}>
            {pending ? "Signing In..." : "Sign In"}
        </Button>
    );
};

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <form action={login} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="admin@discreetkit.com" 
            className="pl-10 h-11"
            required 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            className="pl-10 pr-10 h-11"
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
      <SubmitButton />
    </form>
  );
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <Card className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-4 pb-8 pt-8">
          {/* DiscreetKit Wordmark */}
          <div className="flex justify-center">
            <h1 className="font-headline text-4xl font-black tracking-tight uppercase">
              Discreet<span className="text-primary">Kit</span>.
            </h1>
          </div>
          
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          <LoginForm />
          
          {/* Back to home link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
