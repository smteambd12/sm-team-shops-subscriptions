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
      (event, session) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-fit">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SM TEAM SHOPS
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              আপনার অ্যাকাউন্টে প্রবেশ করুন বা নতুন অ্যাকাউন্ট তৈরি করুন
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <Tabs defaultValue="login" className="w-full">
              {/* ✅ FIXED TABS UI FOR MOBILE */}
              <TabsList className="w-full grid grid-cols-2 gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="login" 
                  className="w-full py-2.5 text-sm font-medium text-center rounded-md"
                >
                  লগইন
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="w-full py-2.5 text-sm font-medium text-center rounded-md"
                >
                  রেজিস্টার
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="flex items-center gap-2 text-gray-700 font-medium">
                      <Mail className="h-4 w-4 text-purple-500" />
                      ইমেইল
                    </Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="আপনার ইমেইল"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="flex items-center gap-2 text-gray-700 font-medium">
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
                        className="h-12 text-base pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
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

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="flex items-center gap-2 text-gray-700 font-medium">
                      <UserIcon className="h-4 w-4 text-purple-500" />
                      পূর্ণ নাম
                    </Label>
                    <Input
                      id="registerName"
                      type="text"
                      placeholder="আপনার পূর্ণ নাম"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPhone" className="flex items-center gap-2 text-gray-700 font-medium">
                      <Phone className="h-4 w-4 text-purple-500" />
                      ফোন নম্বর
                    </Label>
                    <Input
                      id="registerPhone"
                      type="tel"
                      placeholder="আপনার ফোন নম্বর"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="flex items-center gap-2 text-gray-700 font-medium">
                      <Mail className="h-4 w-4 text-purple-500" />
                      ইমেইল
                    </Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="আপনার ইমেইল"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="flex items-center gap-2 text-gray-700 font-medium">
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
                        className="h-12 text-base pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
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
              <a 
                href="/" 
                className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
              >
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
