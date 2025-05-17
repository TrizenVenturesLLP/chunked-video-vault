
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/services/messageService';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { settings: messageSettings, updateSettings } = useMessageStore();

  const handleSettingsUpdate = async () => {
    setIsUpdating(true);
    try {
      // Settings are automatically persisted by the store
      toast({
        title: 'Settings updated',
        description: 'Your message preferences have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your message preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Message Settings</CardTitle>
            <CardDescription>Configure your message notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all message notifications
                </p>
              </div>
              <Switch
                checked={messageSettings.notifications}
                onCheckedChange={(checked) =>
                  updateSettings({ notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play a sound when new messages arrive
                </p>
              </div>
              <Switch
                checked={messageSettings.sound}
                onCheckedChange={(checked) =>
                  updateSettings({ sound: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications for new messages
                </p>
              </div>
              <Switch
                checked={messageSettings.desktop}
                onCheckedChange={(checked) =>
                  updateSettings({ desktop: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Message Preview</Label>
                <p className="text-sm text-muted-foreground">
                  Show message content in notifications
                </p>
              </div>
              <Switch
                checked={messageSettings.preview}
                onCheckedChange={(checked) =>
                  updateSettings({ preview: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
