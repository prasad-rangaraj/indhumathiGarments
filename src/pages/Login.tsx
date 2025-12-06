import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo-new.png";
import bgCotton from "@/assets/bg-cotton-1.jpg";

type LoginType = "customer" | "admin";

const Login = () => {
  const [loginType, setLoginType] = useState<LoginType>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { useAuthStore } = await import('@/stores/authStore');
      const { login } = useAuthStore.getState();
      
      await login(email, password);
      
      const { user } = useAuthStore.getState();
      
      setIsLoading(false);
      
      if (user?.role === "admin") {
        navigate("/admin");
        toast({
          title: "Welcome Admin",
          description: "Redirecting to admin dashboard...",
        });
      } else {
        navigate("/about");
        toast({
          title: "Welcome",
          description: "Redirecting to customer area...",
        });
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const userType = loginType === "admin" ? "Admin" : "Customer";
  const buttonText = isLoading ? "Signing in..." : `Sign in as ${userType}`;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image - Fixed */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgCotton})` }}
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100/80 via-pink-50/70 to-pink-100/80 backdrop-blur-sm" />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 px-4 sm:px-0">
      <img 
              src={logoImg} 
              alt="Indhumathi" 
              className="h-20 sm:h-24 md:h-28 lg:h-32 mx-auto mb-4 drop-shadow-lg"
            />
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Logo Section */}
          {/* <div className=" text-center border-b border-border/30">
            
            <p className="text-muted-foreground text-sm">
              Pure Cotton Women's Innerwear
            </p>
          </div> */}

          {/* Login Type Toggle */}
          <div className="flex p-2 pt-0 m-6 mb-0 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginType("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                loginType === "customer"
                  ? "bg-pink-200 text-pink-900 shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                loginType === "admin"
                  ? "bg-pink-200 text-pink-900 shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background/50 border-border/50 focus:border-pink-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus:border-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-pink-300" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-pink-400 hover:text-pink-500 hover:underline font-medium">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900 font-semibold text-base shadow-lg"
            >
              {buttonText}
            </Button>

            {loginType === "customer" && (
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" className="text-pink-400 hover:text-pink-500 hover:underline font-medium">
                  Sign Up
                </button>
              </p>
            )}
          </form>
        </div>

        {/* Back to Customer Area */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/about")}
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            ← Browse as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
