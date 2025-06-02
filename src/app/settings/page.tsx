'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

interface UserSettings {
  defaultPlatform: 'youtube' | 'instagram' | 'tiktok';
  emailNotifications: boolean;
  customPromptPreferences: {
    includeEmojis: boolean;
    includeBrackets: boolean;
    useHashtags: boolean;
  };
  language: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    defaultPlatform: 'youtube',
    emailNotifications: true,
    customPromptPreferences: {
      includeEmojis: true,
      includeBrackets: true,
      useHashtags: true,
    },
    language: 'en',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load settings. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSettings();
    }
  }, [session, status, router, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        variant: 'success',
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <>
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Settings',
            description: 'Customize your title generation experience.',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://youtubetitle.tool',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Settings',
                  item: 'https://youtubetitle.tool/settings',
                },
              ],
            },
          }),
        }}
      />
      <main className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Customize your title generation experience</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10"
          >
            {/* Default Platform */}
            <div className="space-y-3">
              <Label className="text-white">Default Platform</Label>
              <Select
                value={settings.defaultPlatform}
                onValueChange={(value: 'youtube' | 'instagram' | 'tiktok') =>
                  setSettings({ ...settings, defaultPlatform: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive updates about new features and tips</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            {/* Custom Prompt Preferences */}
            <div className="space-y-4">
              <Label className="text-white">Title Style Preferences</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Include Emojis</Label>
                  <Switch
                    checked={settings.customPromptPreferences.includeEmojis}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        customPromptPreferences: {
                          ...settings.customPromptPreferences,
                          includeEmojis: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Use Brackets [Like This]</Label>
                  <Switch
                    checked={settings.customPromptPreferences.includeBrackets}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        customPromptPreferences: {
                          ...settings.customPromptPreferences,
                          includeBrackets: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Include Hashtags</Label>
                  <Switch
                    checked={settings.customPromptPreferences.useHashtags}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        customPromptPreferences: {
                          ...settings.customPromptPreferences,
                          useHashtags: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Language Preference */}
            <div className="space-y-3">
              <Label className="text-white">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
} 