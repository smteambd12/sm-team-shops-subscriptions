
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Image, 
  Calendar, 
  MessageCircle, 
  Calculator, 
  Languages,
  Zap,
  ExternalLink
} from 'lucide-react';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  feature_url: string;
  credits_required: number;
}

interface AIFeatureGridProps {
  userCredits: number;
  onCreditsUpdate: () => void;
}

const iconMap = {
  FileText,
  Image,
  Calendar,
  MessageCircle,
  Calculator,
  Languages,
  Zap
};

const AIFeatureGrid: React.FC<AIFeatureGridProps> = ({ userCredits, onCreditsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_features')
        .select('*')
        .eq('is_active', true)
        .order('credits_required', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching AI features:', error);
      toast({
        title: "ত্রুটি",
        description: "AI ফিচার লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureAccess = async (feature: AIFeature) => {
    if (userCredits < feature.credits_required) {
      toast({
        title: "অপর্যাপ্ত ক্রেডিট",
        description: `এই ফিচার ব্যবহারের জন্য ${feature.credits_required} ক্রেডিট প্রয়োজন। আপনার কাছে ${userCredits} ক্রেডিট আছে।`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Deduct credits
      const { error } = await supabase
        .from('user_credits')
        .update({ 
          credits_balance: userCredits - feature.credits_required 
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: `${feature.credits_required} ক্রেডিট কাটা হয়েছে। ${feature.name} ব্যবহার করুন।`,
      });

      onCreditsUpdate();
      
      // Open feature in new tab
      window.open(feature.feature_url, '_blank');
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "ত্রুটি",
        description: "ক্রেডিট কাটতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      generator: 'bg-purple-100 text-purple-800',
      calendar: 'bg-blue-100 text-blue-800',
      assistant: 'bg-green-100 text-green-800',
      calculator: 'bg-orange-100 text-orange-800',
      translator: 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => {
        const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Zap;
        const canAfford = userCredits >= feature.credits_required;

        return (
          <Card 
            key={feature.id} 
            className={`transition-all duration-200 hover:shadow-lg ${
              canAfford ? 'hover:scale-105 cursor-pointer' : 'opacity-75'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(feature.category)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {feature.credits_required} ক্রেডিট
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-4">
                {feature.description}
              </CardDescription>
              <Button 
                onClick={() => handleFeatureAccess(feature)}
                disabled={!canAfford}
                className="w-full"
                variant={canAfford ? "default" : "outline"}
              >
                {canAfford ? (
                  <>
                    ব্যবহার করুন
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    অপর্যাপ্ত ক্রেডিট
                    <Zap className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AIFeatureGrid;
