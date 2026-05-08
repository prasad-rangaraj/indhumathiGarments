import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo-new.png";
import bgCotton from "@/assets/bg-cotton-1.jpg";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      
      if (user?.role === "admin" || user?.role === "super_admin") {
        navigate("/admin");
        toast({
          title: "Welcome Admin",
          description: "Redirecting to admin dashboard...",
        });
      } else {
        navigate("/");
        toast({
          title: "Welcome Back",
          description: "Redirecting to your account...",
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

  const handleGoogleLogin = async (token: string) => {
    setIsLoading(true);
    try {
      const { useAuthStore } = await import('@/stores/authStore');
      const { googleLogin } = useAuthStore.getState();
      await googleLogin(token);
      
      const { user } = useAuthStore.getState();
      setIsLoading(false);
      
      if (user?.role === "admin" || user?.role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      toast({
        title: "Welcome",
        description: "Logged in with Google successfully",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Google login failed",
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
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 px-4 sm:px-0">
      <img 
              src={logoImg} 
              alt="Indhumathi" 
              className="h-20 sm:h-24 md:h-28 lg:h-32 mx-auto mb-4 drop-shadow-lg"
            />
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <h2 className="text-2xl font-semibold text-center text-pink-900 mb-6">Sign In</h2>
            
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase px-2">
                <span className="bg-card text-muted-foreground bg-white px-2">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  if (credentialResponse.credential) {
                    handleGoogleLogin(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  toast({
                    title: "Login Failed",
                    description: "Google login was unsuccessful",
                    variant: "destructive",
                  });
                }}
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                type="button" 
                onClick={() => navigate("/signup")}
                className="text-pink-400 hover:text-pink-500 hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* Back to Customer Area */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
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
