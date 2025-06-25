
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FavoriteButtonProps {
  productId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, productId]);

  const checkFavoriteStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsFavorite(!!data);
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "প্রিয় তালিকায় যোগ করতে প্রথমে লগইন করুন।",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "সফল",
          description: "প্রিয় তালিকা থেকে সরানো হয়েছে।",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "সফল",
          description: "প্রিয় তালিকায় যোগ করা হয়েছে।",
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রিয় তালিকা আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${isFavorite ? 'text-red-500 border-red-500' : 'text-gray-500'}`}
    >
      <Heart 
        size={16} 
        className={isFavorite ? 'fill-current' : ''} 
      />
    </Button>
  );
};

export default FavoriteButton;
