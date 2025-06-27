
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "সফল লগইন",
        description: "আপনি সফলভাবে লগইন করেছেন।",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "লগইন ত্রুটি",
        description: error.message === 'Invalid login credentials' 
          ? "ইমেইল বা পাসওয়ার্ড ভুল।" 
          : "লগইন করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            লগইন
          </CardTitle>
          <CardDescription>
            আপনার অ্যাকাউন্টে লগইন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ইমেইল
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল লিখুন"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              অ্যাকাউন্ট নেই?{' '}
              <Link to="/register" className="text-primary hover:underline">
                রেজিস্টার করুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
