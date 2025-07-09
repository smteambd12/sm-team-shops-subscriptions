import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড একই হতে হবে।');
      return;
    }

    if (formData.password.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim()
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes("user already registered") || error.message.toLowerCase().includes("email")) {
          setErrorDialogOpen(true);
        } else {
          alert("রেজিস্ট্রেশন করতে সমস্যা হয়েছে।");
        }
        return;
      }

      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert("রেজিস্ট্রেশন করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            রেজিস্টার
          </CardTitle>
          <CardDescription>
            নতুন অ্যাকাউন্ট তৈরি করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                পূর্ণ নাম
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ইমেইল
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="আপনার ইমেইল লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                ফোন নম্বর
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
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
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                পাসওয়ার্ড নিশ্চিত করুন
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link to="/login" className="text-primary hover:underline">
                লগইন করুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={(open) => {
        setSuccessDialogOpen(open);
        if (!open) {
          setTimeout(() => navigate('/login'), 3000);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 সফল রেজিস্ট্রেশন</DialogTitle>
            <DialogDescription>
              আপনি সফলভাবে রেজিস্টার করেছেন ✅<br />
              অনুগ্রহ করে <strong>১–২ মিনিট অপেক্ষা করুন</strong> এবং আপনার <strong>ইমেইল ইনবক্স</strong> অথবা <strong>স্প্যাম ফোল্ডারে</strong> একটি কনফার্মেশন ইমেইল খুঁজে দেখুন।
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ রেজিস্ট্রেশন ব্যর্থ</DialogTitle>
            <DialogDescription>
              এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি হয়েছে।
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
