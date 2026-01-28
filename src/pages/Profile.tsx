import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '../components/ui/use-toast';
import { Loader2, User, Phone, MapPin, Mail, Save } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuthStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
        setFormData({
            name: user.name,
            phone: user.phone,
            address: user.address || '',
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await userAPI.updateProfile(formData);
      // Update local store
      login(updatedUser, localStorage.getItem('token') || ''); 
      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
      return (
          <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
                <p>Please login to view your profile.</p>
            </div>
            <Footer />
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-card rounded-lg border p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-xl font-semibold mb-6">Personal Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email Address
                            </label>
                            <input
                                type="email"
                                disabled
                                value={user.email}
                                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Shipping Address
                            </label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
