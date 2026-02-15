import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Icons } from '../Icons';

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

export const AuthForm: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) return;
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUp(email.trim(), password);
                if (error) throw error;
                toast.success('Account created! Welcome to PromptCraft.');
                navigate('/app', { replace: true });
            } else {
                const { error } = await signIn(email.trim(), password);
                if (error) throw error;
                toast.success('Welcome back.');
                navigate(from, { replace: true });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            // OAuth will redirect, no need to navigate
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            toast.error(message);
            setGoogleLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm mx-auto"
        >
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
                    <Icons.Magic className="w-5 h-5" />
                    <span className="font-semibold text-gradient-animate">PromptCraft AI</span>
                </Link>
            </div>

            <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl text-zinc-100">
                        {isSignUp ? 'Create account' : 'Welcome back'}
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        {isSignUp ? 'Sign up to start creating AI prompts.' : 'Sign in to continue creating.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Google OAuth Button */}
                    <Button
                        variant="outline"
                        className="w-full border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 min-h-[44px]"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                    >
                        {googleLoading ? (
                            <Icons.Loading className="w-4 h-4 animate-spin" />
                        ) : (
                            <GoogleIcon className="w-4 h-4" />
                        )}
                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900/60 px-2 text-zinc-500">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-400">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-400">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full min-h-[44px]"
                        >
                            {loading ? (
                                <>
                                    <Icons.Loading className="w-4 h-4 animate-spin" />
                                    {isSignUp ? 'Creating...' : 'Signing in...'}
                                </>
                            ) : (
                                isSignUp ? 'Sign up' : 'Sign in'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-0">
                    <p className="text-center text-sm text-zinc-500 w-full">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-zinc-300 hover:text-zinc-100 underline underline-offset-2 transition-colors"
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                </CardFooter>
            </Card>

            <p className="mt-6 text-center">
                <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
                    ← Back to home
                </Link>
            </p>
        </motion.div>
    );
};
