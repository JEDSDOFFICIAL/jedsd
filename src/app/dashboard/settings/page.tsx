"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { 
  Settings, 
  Shield, 
  Bell, 
  Eye, 
  Moon, 
  Sun, 
  Key, 
  Mail,
  Save 
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    paperUpdateAlerts: true,
    reviewReminders: true,
    darkMode: false,
    publicProfile: false,
    twoFactorAuth: false,
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // API call to save settings
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={session.user.name || ""} disabled />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input value={session.user.email || ""} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>User Type</Label>
                <div className="mt-2">
                  <Badge variant="secondary">{session.user.userType}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Paper Update Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when papers you submitted receive updates
                </p>
              </div>
              <Switch
                checked={settings.paperUpdateAlerts}
                onCheckedChange={(checked) => handleSettingChange("paperUpdateAlerts", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for pending review assignments
                </p>
              </div>
              <Switch
                checked={settings.reviewReminders}
                onCheckedChange={(checked) => handleSettingChange("reviewReminders", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile and research interests
                </p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={(checked) => handleSettingChange("publicProfile", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Change Password</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
              </div>
              <Button variant="outline" className="w-fit">
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
