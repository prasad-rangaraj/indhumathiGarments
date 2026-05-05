import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Shield, AlertCircle, CheckCircle2, User, Mail, Phone, MapPin, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { clearSettingsCache } from "@/hooks/useSiteSettings";

const checkPasswordStrength = (password: string) => {
  const feedback: string[] = [];
  let score = 0;
  if (password.length >= 8) score++; else feedback.push('At least 8 characters');
  if (/[a-z]/.test(password)) score++; else feedback.push('One lowercase letter');
  if (/[A-Z]/.test(password)) score++; else feedback.push('One uppercase letter');
  if (/[0-9]/.test(password)) score++; else feedback.push('One number');
  if (/[^a-zA-Z0-9]/.test(password)) score++; else feedback.push('One special character');
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  return { strength, score, feedback };
};

const Settings = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: "Indhumathi",
    tagline: "Pure Cotton Women's Innerwear",
    email: "indhumathi.img@gmail.com",
    phone: "+91 87546 09226",
    address: "Teachers colony 2nd street, Pandian nagar, Tiruppur,Tamilnadu . - 641604",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'super_admin'].includes(user?.role || '')) {
      navigate('/admin');
      return;
    }
    const loadSettings = async () => {
      try {
        const { settingsAPI } = await import('@/lib/api');
        const data = await settingsAPI.get();
        setSettings(prev => ({
          ...prev,
          siteName: data.siteName || prev.siteName,
          tagline: data.tagline || prev.tagline,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          address: data.address || prev.address,
        }));
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, [isAuthenticated, user, navigate]);

  const handleSave = async (type: 'general' | 'password') => {
    setLoading(true);
    try {
      const { settingsAPI } = await import('@/lib/api');
      
      if (type === 'general') {
        await settingsAPI.save({
          siteName: settings.siteName,
          tagline: settings.tagline,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
        });
        clearSettingsCache();
        toast({ title: "Settings Saved", description: "General settings updated successfully" });
      } else {
        if (settings.newPassword !== settings.confirmPassword) {
           throw new Error("New passwords do not match");
        }
        await settingsAPI.changePassword({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        });
        setSettings(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        toast({ title: "Password Updated", description: "Security settings updated successfully" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Action failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
        <p className="text-muted-foreground">Manage your store configuration and security preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex md:flex-col h-auto bg-transparent border-none space-x-2 md:space-x-0 md:space-y-1 w-full md:w-64 p-0">
            <TabsTrigger value="general" className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all w-full">
              <Globe className="w-4 h-4 mr-3" />
              General
            </TabsTrigger>
            <TabsTrigger value="contact" className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all w-full">
              <Mail className="w-4 h-4 mr-3" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all w-full">
              <Shield className="w-4 h-4 mr-3" />
              Security
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure your store's identity and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Store Name</Label>
                      <p className="text-sm text-muted-foreground">The name of your store shown in emails and title tags.</p>
                    </div>
                    <Input 
                      value={settings.siteName} 
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Store Tagline</Label>
                      <p className="text-sm text-muted-foreground">A short slogan or description displayed in the footer.</p>
                    </div>
                    <Input 
                      value={settings.tagline} 
                      onChange={(e) => setSettings({...settings, tagline: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleSave('general')} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                  <CardDescription>How customers can reach your business.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Support Email</Label>
                      <p className="text-sm text-muted-foreground">Public email address for customer inquiries.</p>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={settings.email} 
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Phone Number</Label>
                      <p className="text-sm text-muted-foreground">Business contact number.</p>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={settings.phone} 
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Store Address</Label>
                      <p className="text-sm text-muted-foreground">Physical location for returns and business registration.</p>
                    </div>
                    <Textarea 
                      value={settings.address} 
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="min-h-[100px] bg-background"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleSave('general')} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Security & Password</CardTitle>
                  <CardDescription>Keep your administrative account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b pb-6 border-border/50">
                    <div className="space-y-1">
                      <Label className="text-base">Current Password</Label>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={settings.currentPassword} 
                        onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                        className="bg-background pr-10"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">New Password</Label>
                      <p className="text-sm text-muted-foreground">Choose a strong, unique password.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <Input 
                          type={showNewPassword ? "text" : "password"}
                          value={settings.newPassword} 
                          onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                          className="bg-background pr-10"
                        />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-muted-foreground">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {settings.newPassword && (
                        <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-xs">
                           <div className="flex justify-between items-center">
                             <span>Password Strength</span>
                             <span className={checkPasswordStrength(settings.newPassword).strength === 'strong' ? 'text-green-600' : 'text-yellow-600'}>
                               {checkPasswordStrength(settings.newPassword).strength.toUpperCase()}
                             </span>
                           </div>
                           <div className="h-1 bg-border rounded-full overflow-hidden">
                             <div className={`h-full ${checkPasswordStrength(settings.newPassword).strength === 'strong' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${(checkPasswordStrength(settings.newPassword).score / 5) * 100}%`}}></div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-1">
                      <Label className="text-base">Confirm Password</Label>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={settings.confirmPassword} 
                        onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                        className="bg-background pr-10"
                      />
                      <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleSave('password')} disabled={loading || !settings.newPassword}>
                      <Lock className="w-4 h-4 mr-2" /> Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 border-dashed bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Developer Mode: Payment Keys</p>
                      <p className="text-sm text-muted-foreground">
                        Payment credentials (Razorpay) are now strictly managed via the server environment (`.env`) for maximum security. 
                        To change keys, please update the `RAZORPAY_KEY_ID` in your backend configuration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
