import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-new.png";
import bgCotton from "@/assets/bg-cotton-1.jpg";
import { useAuthStore } from "@/stores/authStore";

const Signup = () => {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, verifyOtp } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register(formData);
      setIsLoading(false);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await verifyOtp(formData.email, otp);
      setIsLoading(false);
      
      toast({
        title: "Verification Successful",
        description: "Welcome to Indhumathi Garments!",
      });
      
      navigate("/about");
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid OTP",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image - Fixed */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgCotton})` }}
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100/80 via-pink-50/70 to-pink-100/80 backdrop-blur-sm" />
      
      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 px-4 sm:px-0">
        <img 
          src={logoImg} 
          alt="Indhumathi" 
          className="h-16 mx-auto mb-2 drop-shadow-lg"
        />
        
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {step === "details" ? (
            <form onSubmit={handleRegister} className="p-4 space-y-3">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold text-pink-900">Create Account</h2>
                <p className="text-xs text-muted-foreground">Join us for premium innerwear</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Jane Doe" 
                      required 
                      className="pl-9 h-9 bg-background/50 border-border/50 focus:border-pink-300 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="jane@example.com" 
                      required 
                      className="pl-9 h-9 bg-background/50 border-border/50 focus:border-pink-300 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        placeholder="9876543210" 
                        required 
                        className="pl-9 h-9 bg-background/50 border-border/50 focus:border-pink-300 transition-all text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="City, State" 
                        className="pl-9 h-9 bg-background/50 border-border/50 focus:border-pink-300 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      className="h-9 bg-background/50 border-border/50 focus:border-pink-300 transition-all pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-4 bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900 font-semibold text-sm shadow-lg transition-all hover:scale-[1.02]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">Get OTP <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>

              <div className="text-center pt-2 border-t border-border/50 mt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => navigate("/login")} 
                    className="text-pink-500 hover:text-pink-600 font-medium hover:underline transition-all"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4 animate-pulse">
                  <Mail className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-2xl font-semibold text-pink-900">Verify Email</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px] mx-auto">
                  We've sent a 6-digit code to <br/> <span className="font-medium text-foreground">{formData.email}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
                  <Input 
                    id="otp" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                    placeholder="• • • • • •" 
                    className="text-center text-3xl tracking-[1em] font-mono h-16 bg-background/50 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all placeholder:tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                
                <p className="text-center text-xs text-muted-foreground">
                  Didn't receive the code? <button type="button" className="text-pink-500 hover:underline">Resend</button>
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900 font-semibold shadow-lg transition-all hover:scale-[1.02]"
                >
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </Button>

                <button 
                  type="button" 
                  onClick={() => setStep("details")}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Email
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Guest Area */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/about")}
            className="text-white/90 hover:text-white text-sm font-medium transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20"
          >
            ← Browse as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
