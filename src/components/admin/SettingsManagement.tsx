
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SettingsManagement = () => {
  const { settings, loading, refetch } = useSiteSettings();
  const [saving, setSaving] = useState(false);

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ setting_key: key, setting_value: value }]);

      if (error) throw error;
      
      toast.success('Setting updated successfully');
      await refetch();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bkash">bKash Number</Label>
            <div className="flex gap-2">
              <Input
                id="bkash"
                defaultValue={settings.bkash_number}
                placeholder="Enter bKash number"
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('bkash') as HTMLInputElement;
                  updateSetting('bkash_number', input.value);
                }}
                disabled={saving}
              >
                Update
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="nagad">Nagad Number</Label>
            <div className="flex gap-2">
              <Input
                id="nagad"
                defaultValue={settings.nagad_number}
                placeholder="Enter Nagad number"
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('nagad') as HTMLInputElement;
                  updateSetting('nagad_number', input.value);
                }}
                disabled={saving}
              >
                Update
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="rocket">Rocket Number</Label>
            <div className="flex gap-2">
              <Input
                id="rocket"
                defaultValue={settings.rocket_number}
                placeholder="Enter Rocket number"
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('rocket') as HTMLInputElement;
                  updateSetting('rocket_number', input.value);
                }}
                disabled={saving}
              >
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManagement;
