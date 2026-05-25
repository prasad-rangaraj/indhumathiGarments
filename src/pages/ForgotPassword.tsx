import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { authAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await authAPI.forgotPassword(email);
      setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed top-0 left-0 w-full h-[100lvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8 card-elegant p-8 rounded-xl shadow-lg border border-border/50">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Forgot Password</h2>
            <p className="mt-2 text-muted-foreground">Enter your email to receive a reset link</p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
