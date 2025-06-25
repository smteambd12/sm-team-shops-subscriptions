
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "লগইন ব্যর্থ",
            description: "ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।",
            variant: "destructive",
          });
        } else {
          toast({
            title: "লগইন ব্যর্থ",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "সফলভাবে লগইন হয়েছে",
          description: "স্বাগতম!",
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: registerName,
            phone: registerPhone,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "অ্যাকাউন্ট বিদ্যমান",
            description: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। লগইন করুন।",
            variant: "destructive",
          });
        } else {
          toast({
            title: "রেজিস্ট্রেশন ব্যর্থ",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "রেজিস্ট্রেশন সফল",
          description: "আপনার ইমেইল চেক করুন এবং অ্যাকাউন্ট যাচাই করুন।",
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SM TEAM SHOPS
          </CardTitle>
          <CardDescription>
            আপনার অ্যাকাউন্টে প্রবেশ করুন বা নতুন অ্যাকাউন্ট তৈরি করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">লগইন</TabsTrigger>
              <TabsTrigger value="register">রেজিস্টার</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">ইমেইল</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">পাসওয়ার্ড</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="আপনার পাসওয়ার্ড"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registerName">পূর্ণ নাম</Label>
                  <Input
                    id="registerName"
                    type="text"
                    placeholder="আপনার পূর্ণ নাম"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPhone">ফোন নম্বর</Label>
                  <Input
                    id="registerPhone"
                    type="tel"
                    placeholder="আপনার ফোন নম্বর"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">ইমেইল</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">পাসওয়ার্ড</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder="আপনার পাসওয়ার্ড"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
