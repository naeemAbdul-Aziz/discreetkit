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
import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing In..." : "Sign In"}
        </Button>
    );
};

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <form action={login} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@discreetkit.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
             <Input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                onClick={togglePasswordVisibility}
            >
                {showPassword ? <EyeOff /> : <Eye />}
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
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761573359/Artboard_3_b2vstg.png"
            alt="DiscreetKit Logo"
            width={48}
            height={48}
            className="mb-2"
          />
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
