import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingSeconds, setLoadingSeconds] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingSeconds(0);

        // Show "warming up" message if server takes > 5s (Render free tier cold start)
        const timer = setInterval(() => {
            setLoadingSeconds((s) => s + 1);
        }, 1000);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            login(data.token, data.user);
            toast.success('Login successful');
            navigate('/');
        } catch (err: any) {
            toast.error(err.message || 'Connecting to server failed');
        } finally {
            clearInterval(timer);
            setIsLoading(false);
            setLoadingSeconds(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-xl border-border/50">
                <CardHeader className="space-y-3 text-center pb-2">
                    <div className="flex justify-center">
                        <img src="/logo.png" alt="Perfect Plan POS" className="h-16 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Perfect Plan POS</CardTitle>
                    <CardDescription>Enter your credentials to access the terminal</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Email or Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12"
                                autoComplete="current-password"
                            />
                        </div>
                        {isLoading && loadingSeconds >= 5 && (
                            <p className="text-xs text-muted-foreground text-center animate-pulse">
                                ⏳ Server is waking up, please wait... ({loadingSeconds}s)
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (loadingSeconds > 0 ? `Signing In... (${loadingSeconds}s)` : 'Signing In...') : 'Sign In'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
