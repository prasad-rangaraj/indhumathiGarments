import { useState, useEffect } from "react";
import { Save, Upload, Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo-new.png";

// Password strength checker
const checkPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('At least 8 characters');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('One lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('One uppercase letter');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('One number');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('One special character');
  } else {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { strength, score, feedback };
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const Settings = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong'; score: number; feedback: string[] } | null>(null);
  
  const [settings, setSettings] = useState({
    siteName: "Indhumathi",
    tagline: "Pure Cotton Women's Innerwear",
    email: "contact@indhumathi.com",
    phone: "+91 98765 43210",
    address: "123, Textile Street, Tirupur, Tamil Nadu - 641604",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    razorpayKey: "",
    razorpaySecret: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  // Validate password strength
  useEffect(() => {
    if (settings.newPassword) {
      setPasswordStrength(checkPasswordStrength(settings.newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [settings.newPassword]);

  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Site name validation
    if (!settings.siteName || settings.siteName.length < 2) {
      newErrors.siteName = 'Site name must be at least 2 characters';
    }

    // Email validation
    if (!isValidEmail(settings.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (settings.phone && !isValidPhone(settings.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation (if changing password)
    if (settings.currentPassword || settings.newPassword || settings.confirmPassword) {
      if (!settings.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!settings.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordStrength && passwordStrength.strength === 'weak') {
        newErrors.newPassword = 'Password is too weak. Please use a stronger password.';
      }
      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (settings.currentPassword === settings.newPassword) {
        newErrors.newPassword = 'New password must be different from current password';
      }
    }

    // Razorpay validation
    if (settings.razorpayKey && !settings.razorpayKey.startsWith('rzp_')) {
      newErrors.razorpayKey = 'Invalid Razorpay Key ID format';
    }
    if (settings.razorpaySecret && settings.razorpaySecret.length < 20) {
      newErrors.razorpaySecret = 'Invalid Razorpay Secret format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input
    const sanitized = sanitizeInput(value);
    setSettings({ ...settings, [field]: sanitized });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSave = async () => {
    // Validate all inputs
    if (!validateInputs()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Separate password change from other settings
      const settingsData: any = {
        siteName: settings.siteName,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      };

      // Only include payment settings if they're being updated
      if (settings.razorpayKey || settings.razorpaySecret) {
        settingsData.razorpayKey = settings.razorpayKey;
        settingsData.razorpaySecret = settings.razorpaySecret;
      }

      // Import settings API
      const { settingsAPI } = await import('@/lib/api');

      // Call API to save settings (password change should be separate endpoint)
      await settingsAPI.save(settingsData);

      // Handle password change separately if provided
      if (settings.currentPassword && settings.newPassword) {
        await settingsAPI.changePassword({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        });
      }

      // Clear password fields after successful save
      setSettings({
        ...settings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(null);

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength.strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage website and admin settings</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Secure Connection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Logo</Label>
              <div className="flex items-center gap-4">
                <img src={logoImg} alt="Logo" className="h-12 object-contain" />
                <Button variant="outline" size="sm" type="button" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Logo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name *</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                maxLength={100}
                required
              />
              {errors.siteName && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.siteName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                maxLength={200}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email *</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                maxLength={255}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={20}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={settings.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={settings.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordStrength && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === 'strong' ? 'bg-green-500' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {passwordStrength.feedback.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordStrength.strength === 'strong' && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Strong password!
                    </p>
                  )}
                </div>
              )}
              {errors.newPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={settings.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Payment credentials are encrypted and stored securely. Never share these keys.</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpayKey">Razorpay Key ID</Label>
              <Input
                id="razorpayKey"
                value={settings.razorpayKey}
                onChange={(e) => handleInputChange('razorpayKey', e.target.value)}
                placeholder="rzp_live_xxxxxxxx"
                maxLength={50}
                autoComplete="off"
              />
              {errors.razorpayKey && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.razorpayKey}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpaySecret">Razorpay Secret</Label>
              <div className="relative">
                <Input
                  id="razorpaySecret"
                  type={showRazorpaySecret ? "text" : "password"}
                  value={settings.razorpaySecret}
                  onChange={(e) => handleInputChange('razorpaySecret', e.target.value)}
                  placeholder="••••••••••••"
                  maxLength={100}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle secret visibility"
                >
                  {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.razorpaySecret && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.razorpaySecret}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your Razorpay API keys to enable online payments. Get your keys from the Razorpay Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setSettings({
              siteName: "Indhumathi",
              tagline: "Pure Cotton Women's Innerwear",
              email: "contact@indhumathi.com",
              phone: "+91 98765 43210",
              address: "123, Textile Street, Tirupur, Tamil Nadu - 641604",
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
              razorpayKey: "",
              razorpaySecret: "",
            });
            setErrors({});
            setPasswordStrength(null);
          }}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
