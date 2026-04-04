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
      <div className="relative z-10 w-full max-w-xl mx-4 px-4 sm:px-0 my-8">
        <img 
          src={logoImg} 
          alt="Indhumathi" 
          className="h-16 mx-auto mb-6 drop-shadow-xl transition-transform hover:scale-105"
        />
        
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {step === "details" ? (
            <form onSubmit={handleRegister} className="p-6 sm:p-10 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-pink-900 tracking-tight">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-2">Join us for premium innerwear</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Jane Doe" 
                      required 
                      className="pl-10 h-11 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all text-sm rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="jane@example.com" 
                      required 
                      className="pl-10 h-11 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all text-sm rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="9876543210" 
                      required 
                      className="pl-10 h-11 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all text-sm rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      className="pl-3 pr-10 h-11 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all text-sm rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <Input 
                      id="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      placeholder="City, State" 
                      className="pl-10 h-11 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-8 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold text-base shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">Get OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                )}
              </Button>

              <div className="text-center pt-6 mt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => navigate("/login")} 
                    className="text-pink-600 hover:text-pink-700 font-semibold hover:underline transition-all"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="p-6 sm:p-10 space-y-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-6 shadow-inner animate-pulse">
                  <Mail className="w-10 h-10 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-pink-900 tracking-tight">Verify Email</h2>
                <p className="text-muted-foreground text-sm mt-3">
                  We've sent a 6-digit code to <br/> <span className="font-semibold text-foreground">{formData.email}</span>
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
                  <Input 
                    id="otp" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                    placeholder="• • • • • •" 
                    className="text-center text-3xl tracking-[1em] font-mono h-16 bg-background/60 border-border/60 hover:border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 transition-all placeholder:tracking-widest rounded-xl shadow-sm mx-auto w-full max-w-sm"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                
                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the code? <button type="button" className="text-pink-600 hover:text-pink-700 font-semibold hover:underline">Resend</button>
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                >
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </Button>

                <button 
                  type="button" 
                  onClick={() => setStep("details")}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
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
