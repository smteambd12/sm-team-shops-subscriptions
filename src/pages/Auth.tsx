// Auth.tsx

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
import { Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User as UserIcon, Phone, Smartphone } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate('/');
        }
      }
    );

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
        toast({
          title: "লগইন ব্যর্থ",
          description: error.message.includes("Invalid login credentials")
            ? "ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।"
            : error.message,
          variant: "destructive",
        });
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
        toast({
          title: "রেজিস্ট্রেশন ব্যর্থ",
          description: error.message.includes("User already registered")
            ? "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। লগইন করুন।"
            : error.message,
          variant: "destructive",
        });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-fit">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SM TEAM SHOPS
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-sm sm:text-base">
              আপনার অ্যাকাউন্টে প্রবেশ করুন বা নতুন অ্যাকাউন্ট তৈরি করুন
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-6">
                <TabsTrigger value="login" className="rounded-md py-2.5 text-sm font-medium">
                  লগইন
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-md py-2.5 text-sm font-medium">
                  রেজিস্টার
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="flex gap-2 items-center text-gray-700 font-medium">
                      <Mail className="h-4 w-4 text-purple-500" />
                      ইমেইল
                    </Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="আপনার ইমেইল"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="flex gap-2 items-center text-gray-700 font-medium">
                      <Lock className="h-4 w-4 text-purple-500" />
                      পাসওয়ার্ড
                    </Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 text-base pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-transform"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        লগইন হচ্ছে...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        লগইন করুন
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="flex gap-2 items-center text-gray-700 font-medium">
                      <UserIcon className="h-4 w-4 text-purple-500" />
                      পূর্ণ নাম
                    </Label>
                    <Input
                      id="registerName"
                      type="text"
                      placeholder="আপনার পূর্ণ নাম"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPhone" className="flex gap-2 items-center text-gray-700 font-medium">
                      <Phone className="h-4 w-4 text-purple-500" />
                      ফোন নম্বর
                    </Label>
                    <Input
                      id="registerPhone"
                      type="tel"
                      placeholder="আপনার ফোন নম্বর"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="flex gap-2 items-center text-gray-700 font-medium">
                      <Mail className="h-4 w-4 text-purple-500" />
                      ইমেইল
                    </Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="আপনার ইমেইল"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="flex gap-2 items-center text-gray-700 font-medium">
                      <Lock className="h-4 w-4 text-purple-500" />
                      পাসওয়ার্ড
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="h-12 text-base pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-transform"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        রেজিস্টার হচ্ছে...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        রেজিস্টার করুন
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <a href="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                ← হোমে ফিরুন
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
