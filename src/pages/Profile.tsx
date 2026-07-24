import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import Footer from '@/components/Footer';
import { useAuthStore } from '../stores/authStore';
import { userAPI, customerAPI, ordersAPI, wishlistAPI, couponsAPI } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/use-toast';
import { Loader2, User, MapPin, Package, Heart, LogOut, ChevronRight, ChevronLeft, Save, Plus, Trash2, Edit2, Ticket, Headphones, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import indianStatesData from '@/lib/indianStates.json';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

import { resolveItemImage } from '@/lib/utils';

const OrderCard = ({ order, navigate }: { order: any; navigate: any }) => {
  const { t } = useTranslation();
  return (
  <div
    key={order.id}
    className="border border-gray-200 rounded-sm p-4 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 hover:bg-white group"
  >
    <div className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0 w-full">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-pink-200 transition-colors">
        {(() => {
          const firstItem = order.items?.[0];
          if (!firstItem) return <Package className="text-gray-400" />;
          
          // Map color for resolveItemImage if it exists as color instead of selectedColor (since it bypasses ordersStore)
          const itemForResolution = { ...firstItem, selectedColor: firstItem.color || firstItem.selectedColor };
          const resolvedImg = resolveItemImage(itemForResolution);
          
          if (resolvedImg) {
            return (
              <img
                src={toUrl(resolvedImg)}
                alt="product"
                className="w-full h-full object-cover"
              />
            );
          }
          return <Package className="text-gray-400" />;
        })()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-pink-600 transition-colors truncate">{t('orders.orderId')}{order.orderId}</p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{order.items?.length || 0} {t('orders.items')} • ₹{order.total}</p>

        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-y-1 sm:gap-y-2 gap-x-3 sm:gap-x-4">
          {order.status === 'Delivered' ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-500">
                {t('orders.deliveredOn')} {(() => {
                  const d = new Date(order.orderDate);
                  d.setDate(d.getDate() + 7);
                  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                })()}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-700 uppercase">
                  {order.status}
                  {order.delayedDeliveryDate && <span className="text-red-500 ml-1 lowercase">(delay)</span>}
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('orders.estDelivery')}:</span>
                <span className={`text-xs font-semibold uppercase ${order.delayedDeliveryDate ? 'text-red-500' : 'text-green-600'}`}>
                  {order.delayedDeliveryDate ? (
                    `${new Date(order.delayedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}${order.delayReason ? ` - ${order.delayReason}` : ''}`
                  ) : (() => {
                    const d = new Date(order.orderDate);
                    d.setDate(d.getDate() + 7);
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  })()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <div className="flex gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-8 px-3 flex-1 sm:flex-none border-gray-200"
        onClick={() => navigate(`/order/${order.orderId}`)}
      >
        {t('orders.viewDetails')}
      </Button>
      <Button
        size="sm"
        className="text-xs h-8 px-3 flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 font-bold"
        onClick={() => navigate(`/track/${order.orderId}`)}
      >
        {t('orders.trackOrder')}
      </Button>
    </div>
  </div>
  );
};

export default function Profile() {
  const { t } = useTranslation();
  const { user, login, logout, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist' | 'security' | 'coupons'>('profile');

  // Sync tab with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (['orders', 'addresses', 'wishlist', 'profile', 'security', 'coupons'].includes(tab || '')) {
      setActiveTab(tab as any);
      setShowMobileMenu(false);
    } else {
      setShowMobileMenu(true);
      setActiveTab('profile');
    }
  }, [location.search]);

  // Sub-component States
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [securityView, setSecurityView] = useState<'request-otp' | 'update-password'>('request-otp');
  const [passwordForm, setPasswordForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', address: '', city: '', state: '', district: '', landmark: '', pincode: '', isDefault: false });
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has('tab');
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setLoading(true);
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (e: any) {
      console.error("Failed to fetch orders", e);
      setError(e.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  };

  const groupOrdersByMonth = (ordersList: any[]) => {
    const groups: { [key: string]: any[] } = {};
    ordersList.forEach(order => {
      const date = new Date(order.orderDate);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(order);
    });
    return groups;
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistAPI.get();
      setWishlist(data);
    } catch (e) {
      console.error("Failed to fetch wishlist", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await customerAPI.getAddresses(user.id);
      setAddresses(Array.isArray(data) ? data : ((data as any).addresses || (data as any).data || []));
    } catch (e) {
      console.error("Failed to fetch addresses", e);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPincodeDetails = async (pincodeStr: string) => {
    setIsFetchingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincodeStr}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        const fetchedState = postOffice.State;
        const fetchedDistrict = postOffice.District;

        setAddressForm(prev => ({
          ...prev,
          state: fetchedState,
          district: fetchedDistrict,
          city: prev.city || postOffice.Block || postOffice.Name
        }));

        const stateData = indianStatesData.states.find(s => s.state.toLowerCase() === fetchedState.toLowerCase());
        setAvailableDistricts(stateData ? stateData.districts : [fetchedDistrict]);
        
        toast({ title: "Location Found", description: `${fetchedDistrict}, ${fetchedState}` });
      } else {
        toast({ title: "Invalid Pincode", description: "Please enter state/district manually.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching pincode", err);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const handlePhoneChange = (val: string, setForm: any) => {
    let cleanVal = val.replace(/\D/g, '');
    if (cleanVal.length > 10 && cleanVal.startsWith('91')) cleanVal = cleanVal.slice(2);
    cleanVal = cleanVal.slice(0, 10);
    setForm(prev => ({ ...prev, phone: cleanVal }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(addressForm.phone)) {
      toast({ title: "Invalid Phone Number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    if (addressForm.pincode.length !== 6) {
      toast({ title: "Invalid Pincode", description: "Enter a valid 6-digit pincode.", variant: "destructive" });
      return;
    }
    if (!addressForm.state || !addressForm.district) {
      toast({ title: "Incomplete Address", description: "Please select State and District.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (editingAddress) {
        await customerAPI.updateAddress(editingAddress.id || editingAddress._id, { ...addressForm, userId: user.id });
        toast({ title: 'Address updated successfully' });
      } else {
        await customerAPI.createAddress({ ...addressForm, userId: user.id });
        toast({ title: 'Address added successfully' });
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      toast({ title: 'Failed to save address', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await customerAPI.deleteAddress(id);
      toast({ title: 'Address deleted' });
      fetchAddresses();
    } catch (err: any) {
      toast({ title: 'Failed to delete address', description: err.message, variant: 'destructive' });
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponsAPI.getActive();
      setCoupons(data);
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'wishlist') fetchWishlist();
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'coupons') fetchCoupons();
  }, [activeTab]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({ title: "Invalid Phone Number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await userAPI.updateProfile(formData);
      setUser(updatedUser);
      toast({ title: "Success", description: "Profile Details Updated Successfully!" });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await userAPI.requestPasswordUpdateOtp();
      toast({ title: "OTP Sent", description: "Check your email for the verification code." });
      setSecurityView('update-password');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (!passwordForm.otp || passwordForm.otp.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await userAPI.updatePasswordOtp({ otp: passwordForm.otp, newPassword: passwordForm.newPassword });
      toast({ title: "Success", description: "Password updated successfully!" });
      setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' });
      setSecurityView('request-otp');
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
      <div className="flex-1 container mx-auto px-4 sm:px-4 py-4 sm:py-8 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">

          {/* LEFT SIDEBAR */}
          <div className={`w-full md:w-1/4 space-y-3 ${!showMobileMenu ? 'hidden md:block' : 'block'}`}>
            {/* Header Box */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-pink-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Hello 👋</p>
                <h2 className="font-bold text-gray-800 leading-tight">{user.name}</h2>
                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-100">
              {/* Account Settings Section */}
              <div className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">{t('profile.title')}</p>
              </div>

              {[
                { tab: 'profile', label: t('profile.personalInfo'), icon: <User size={16} /> },
                { tab: 'addresses', label: t('profile.addresses'), icon: <MapPin size={16} /> },
                { tab: 'security', label: t('profile.security'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              ].map(({ tab, label, icon }) => (
                <button
                  key={tab}
                  onClick={() => navigate(`/profile?tab=${tab}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 relative group
                    ${activeTab === tab && !showMobileMenu
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-pink-500'
                    }`}
                >
                  {/* Active left bar */}
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-pink-500 transition-all duration-200 ${activeTab === tab && !showMobileMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`} />
                  <span className={`flex-shrink-0 ${activeTab === tab && !showMobileMenu ? 'text-pink-500' : 'text-gray-400 group-hover:text-pink-400'}`}>{icon}</span>
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronRight size={14} className={`flex-shrink-0 transition-opacity ${activeTab === tab && !showMobileMenu ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`} />
                </button>
              ))}

              <div className="mx-4 my-2 border-t border-gray-100" />

              {/* Other Sections */}
              {[
                { tab: 'coupons', label: t('profile.coupons'), icon: <Ticket size={16} /> },
                { tab: 'orders', label: t('profile.orders'), icon: <Package size={16} /> },
                { tab: 'wishlist', label: t('profile.wishlist'), icon: <Heart size={16} /> },
              ].map(({ tab, label, icon }) => (
                <button
                  key={tab}
                  onClick={() => navigate(`/profile?tab=${tab}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 relative group
                    ${activeTab === tab && !showMobileMenu
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-pink-500'
                    }`}
                >
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-pink-500 transition-all duration-200 ${activeTab === tab && !showMobileMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`} />
                  <span className={`flex-shrink-0 ${activeTab === tab && !showMobileMenu ? 'text-pink-500' : 'text-gray-400 group-hover:text-pink-400'}`}>{icon}</span>
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronRight size={14} className={`flex-shrink-0 transition-opacity ${activeTab === tab && !showMobileMenu ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`} />
                </button>
              ))}

              <div className="mx-4 my-2 border-t border-gray-100" />

              {/* Help & Logout */}
              <button
                onClick={() => navigate('/contact')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-pink-500 transition-all duration-200 group"
              >
                <Headphones size={16} className="flex-shrink-0 text-gray-400 group-hover:text-pink-400" />
                <span className="flex-1 text-left">Help & Support</span>
                <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 pb-4 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 group"
              >
                <LogOut size={16} className="flex-shrink-0 text-gray-400 group-hover:text-red-400" />
                <span className="flex-1 text-left">{t('profile.logout')}</span>
              </button>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className={`w-full md:w-3/4 ${showMobileMenu ? 'hidden md:block' : 'block'}`}>
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 min-h-[500px]">
              {/* Mobile Back Button */}
              <button
                className="md:hidden flex items-center gap-1 text-gray-500 hover:text-pink-600 mb-6 font-medium transition-colors"
                onClick={() => navigate('/profile')}
              >
                <ChevronLeft size={18} /> Back to Menu
              </button>

              {/* Profile Information View */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-pink-100 pb-4">{t('profile.personalInfo')} <span className="text-pink-600 text-sm font-bold cursor-pointer ml-4">{t('profile.edit')}</span></h2>
                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-500">First Name / Full Name</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2.5 focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-500">Email Address (Non-editable)</label>
                      <input type="email" value={user.email} disabled className="w-full border border-gray-200 rounded-sm bg-gray-100 p-2.5 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-500">Mobile Number</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm text-gray-500">+91</span>
                        <input type="tel" maxLength={10} value={formData.phone} onChange={e => handlePhoneChange(e.target.value, setFormData)} className="w-full border border-gray-200 rounded-sm bg-gray-50 py-2.5 pl-10 pr-2 focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all" required />
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-4">
                      <Button type="submit" disabled={loading} className="px-8 bg-pink-600 hover:bg-pink-700 text-white rounded-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-pink-200">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : t('profile.saveChanges').toUpperCase()}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security View */}
              {activeTab === 'security' && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold mb-6 border-b border-pink-100 pb-4">Security Settings</h2>
                  {securityView === 'request-otp' ? (
                    <div className="space-y-6">
                      <p className="text-gray-600 text-sm">To change your password, we'll send a One-Time Password (OTP) to your registered email address ({user.email}).</p>
                      <Button onClick={handleRequestOtp} disabled={loading} className="bg-pink-600 hover:bg-pink-700 font-bold px-8">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "SEND OTP"}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-gray-600 text-sm">An OTP has been sent to {user.email}.</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={passwordForm.otp}
                          onChange={(e) => setPasswordForm({ ...passwordForm, otp: e.target.value })}
                          className="w-full sm:w-2/3 border border-pink-200 rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none tracking-widest font-mono"
                          placeholder="Enter 6-digit OTP"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative w-full sm:w-2/3">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full border border-pink-200 rounded-md p-2 pr-10 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative w-full sm:w-2/3">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full border border-pink-200 rounded-md p-2 pr-10 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 font-bold px-8">
                          {loading ? <Loader2 className="animate-spin mr-2" /> : "UPDATE PASSWORD"}
                        </Button>
                        <Button type="button" onClick={() => setSecurityView('request-otp')} variant="outline" disabled={loading} className="px-8 border-pink-200 hover:bg-pink-50 hover:text-pink-700">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Manage Addresses View */}
              {activeTab === 'addresses' && (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{addresses.length} of 5 addresses saved</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (addresses.length >= 5) {
                          toast({ title: 'Limit Reached', description: 'You can only store up to 5 addresses.', variant: 'destructive' });
                          return;
                        }
                        setEditingAddress(null);
                        setAddressForm({ name: '', phone: '', address: '', city: '', state: '', district: '', landmark: '', pincode: '', isDefault: addresses.length === 0 });
                        setIsAddressModalOpen(true);
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg text-sm px-4 h-9 shadow-sm"
                    >
                      <Plus size={15} className="mr-1.5" /> Add Address
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="animate-spin text-pink-500" size={36} />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-pink-50/60 to-rose-50/40 rounded-2xl border border-dashed border-pink-200">
                      <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                        <MapPin size={30} className="text-pink-400" />
                      </div>
                      <h3 className="text-base font-bold text-gray-700">No Addresses Yet</h3>
                      <p className="text-gray-400 text-sm mt-1.5 max-w-xs mb-6">Add a delivery address to make checkout faster.</p>
                      <Button onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({ name: '', phone: '', address: '', city: '', state: '', district: '', landmark: '', pincode: '', isDefault: true });
                        setIsAddressModalOpen(true);
                      }} className="bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg">
                        <Plus size={15} className="mr-1.5" /> Add New Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr: any) => (
                        <div
                          key={addr.id}
                          className={`relative rounded-xl border p-4 sm:p-5 transition-all bg-white ${
                            addr.isDefault
                              ? 'border-pink-300 ring-1 ring-pink-200 shadow-sm'
                              : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
                          }`}
                        >
                          {/* Top row: name + default badge */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800 text-sm">{addr.name || user.name}</span>
                              <span className="text-gray-400 text-xs">·</span>
                              <span className="text-gray-500 text-xs font-medium">{addr.phone || user.phone}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full border border-pink-200 tracking-wide uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Address text */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin className="text-pink-500 w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {[addr.address, addr.city, addr.landmark ? `Near ${addr.landmark}` : ''].filter(Boolean).join(', ')}
                              <br />
                              <span className="text-gray-500">
                                {[addr.district, addr.state].filter(Boolean).join(', ')}
                                {addr.pincode && <span className="font-semibold text-gray-700"> — {addr.pincode}</span>}
                              </span>
                            </p>
                          </div>

                          {/* Action buttons — always visible, not hover-only */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setEditingAddress(addr);
                                setAddressForm({ name: addr.name || '', phone: addr.phone || '', address: addr.address || '', city: addr.city || '', state: addr.state || '', district: addr.district || '', landmark: addr.landmark || '', pincode: addr.pincode || '', isDefault: addr.isDefault || false });
                                const stateData = indianStatesData.states.find(s => s.state === addr.state);
                                setAvailableDistricts(stateData ? stateData.districts : (addr.district ? [addr.district] : []));
                                setIsAddressModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors border border-pink-200"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id || addr._id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Coupons View */}
              {activeTab === 'coupons' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 border-b border-pink-100 pb-4">My Coupons</h2>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-pink-600" size={32} /></div>
                  ) : coupons.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-pink-50/20 rounded-xl border border-dashed border-pink-200">
                      <Heart className="w-12 h-12 text-pink-200 mx-auto mb-4" />
                      <p>No active coupons available right now.</p>
                      <Button onClick={() => navigate('/products')} className="mt-4 bg-pink-600 hover:bg-pink-700">Explore Collection</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {coupons.map((coupon: any) => (
                        <div key={coupon.id} className="border border-pink-200 bg-pink-50/30 rounded-xl p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-pink-600 text-white font-bold px-3 py-1 rounded text-sm uppercase tracking-wider">{coupon.code}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{coupon.discount}% OFF</h3>
                            <p className="text-sm text-gray-600 mt-1">{coupon.description || `Get ${coupon.discount}% off on your purchase.`}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-pink-200/50 flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">
                              Valid till: {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-pink-300 text-pink-600 hover:bg-pink-100" onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              toast({ title: 'Coupon Copied!', description: 'You can apply it at checkout.' });
                            }}>
                              COPY
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Orders View */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-foreground">My Orders</h2>
                    {ordersLoading && orders.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-pink-600 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                        </span>
                        Updating...
                      </div>
                    )}
                  </div>
                  {ordersLoading && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
                      <div className="relative flex items-center justify-center w-16 h-16">
                        {/* Glowing background aura */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/30 via-rose-400/20 to-pink-300/30 animate-pulse blur-md" />
                        {/* Outer dual spinning ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-pink-100 border-t-pink-600 border-b-rose-500 animate-spin" />
                        {/* Inner icon container */}
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center border border-pink-200/60 shadow-xs">
                          <Package className="w-5 h-5 text-pink-600 animate-bounce" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-gray-700 tracking-wide">Fetching Your Orders</p>
                        <p className="text-xs text-muted-foreground animate-pulse">Gathering latest status updates...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-10">
                      <p className="text-red-500 font-medium mb-3">Error loading orders: {error}</p>
                      <button onClick={fetchOrders} className="text-pink-600 underline text-sm">Try again</button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-pink-50/20 rounded-xl border border-dashed border-pink-200">
                      <Package className="w-12 h-12 text-pink-200 mx-auto mb-4" />
                      <p className="mb-3 font-medium">No orders found.</p>
                      <Button onClick={() => navigate('/products')} className="mt-2 bg-pink-600 hover:bg-pink-700 shadow-sm">Explore Collection</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order: any) => (
                        <OrderCard key={order.id || order.orderId} order={order} navigate={navigate} />
                      ))}

                      {orders.length > 5 && (
                        <div className="pt-4 flex justify-center">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto text-pink-600 border-pink-200 hover:bg-pink-50 font-bold"
                            onClick={() => setIsViewAllOpen(true)}
                          >
                            View All Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View All Orders Dialog */}
                  <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
                    <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden sm:rounded-xl">
                      <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="text-xl">All Orders</DialogTitle>
                      </DialogHeader>

                      <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-gray-50/30">
                        {Object.entries(groupOrdersByMonth(orders)).map(([monthYear, monthOrders]: [string, any]) => (
                          <div key={monthYear} className="relative">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 py-2 border-b border-gray-100">
                              {monthYear}
                            </h3>
                            <div className="space-y-4">
                              {monthOrders.map((order: any) => (
                                <OrderCard key={order.id || order.orderId} order={order} navigate={navigate} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* My Wishlist View */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 border-b border-pink-100 pb-4">My Wishlist ({wishlist.length})</h2>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-pink-600" size={32} /></div>
                  ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-pink-50/20 rounded-xl border border-dashed border-pink-200">
                      <Heart size={48} className="text-pink-200 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800">Empty Wishlist</h3>
                      <p className="text-gray-500 text-sm mt-2">You have no items in your wishlist. Start adding!</p>
                      <Button onClick={() => navigate('/products')} className="mt-6 bg-pink-600 hover:bg-pink-700">Go Shopping</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {wishlist.map((item: any) => {
                        const imgSrc = item.product?.image || item.product?.images?.[0];
                        const resolvedSrc = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${import.meta.env.VITE_API_URL.replace('/api', '')}${imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc}`) : null;
                        return (
                        <div key={item.id} className="border border-pink-100 rounded-xl p-3 relative group bg-white hover:shadow-md transition-all">
                          <button className="absolute top-2 right-2 p-1.5 bg-white shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:text-red-500 border border-pink-50">
                            <Trash2 size={16} />
                          </button>
                          <div className="aspect-[3/4] bg-pink-50 rounded-lg mb-3 overflow-hidden">
                            {resolvedSrc ? <img src={resolvedSrc} alt="w" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-pink-200"><Heart size={32} /></div>}
                          </div>
                          <h3 className="font-bold text-sm truncate text-gray-800">{item.product?.name || 'Product'}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-pink-600">₹{item.product?.price || 0}</span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Address Form Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg p-0 max-h-[92vh] overflow-hidden flex flex-col rounded-2xl">
          {/* Modal Header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                <MapPin size={16} className="text-pink-600" />
              </div>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <p className="text-xs text-gray-400 mt-1 ml-10">Enter your complete delivery address below</p>
          </DialogHeader>

          {/* Scrollable form body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSaveAddress} className="p-5 space-y-5">

              {/* Contact Info */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Full Name</label>
                    <input
                      type="text"
                      value={addressForm.name}
                      onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg bg-gray-50/80 px-3 py-2.5 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Mobile Number</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm text-gray-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={e => handlePhoneChange(e.target.value, setAddressForm)}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50/80 py-2.5 pl-11 pr-3 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                        placeholder="10-digit number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Pincode</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setAddressForm({ ...addressForm, pincode: val });
                          if (val.length === 6) fetchPincodeDetails(val);
                        }}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50/80 px-3 py-2.5 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                        placeholder="6-digit pincode (auto-fills state & district)"
                        required
                      />
                      {isFetchingPincode && <span className="absolute right-3 top-2.5 text-xs text-pink-400 animate-pulse font-medium">Fetching…</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">State</label>
                      <Select value={addressForm.state} onValueChange={(val) => {
                        const stateData = indianStatesData.states.find(s => s.state === val);
                        setAvailableDistricts(stateData ? stateData.districts : []);
                        setAddressForm({ ...addressForm, state: val, district: '' });
                      }}>
                        <SelectTrigger className="w-full h-[42px] text-sm bg-gray-50 rounded-lg border-gray-200">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStatesData.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">District</label>
                      <Select value={addressForm.district} onValueChange={(val) => setAddressForm({ ...addressForm, district: val })} disabled={!addressForm.state}>
                        <SelectTrigger className="w-full h-[42px] text-sm bg-gray-50 rounded-lg border-gray-200">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Address Details</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Flat / House No. / Building / Apartment</label>
                    <textarea
                      value={addressForm.address}
                      onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg bg-gray-50/80 px-3 py-2.5 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                      rows={2}
                      placeholder="e.g. 12B, Rose Apartments"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Area / Street / Village</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50/80 px-3 py-2.5 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                        placeholder="e.g. MG Road"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50/80 px-3 py-2.5 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                        placeholder="e.g. Near Bus Stop"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/60 cursor-pointer hover:bg-pink-50/40 hover:border-pink-200 transition-all">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-pink-600 w-4 h-4 rounded"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Set as Default Address</p>
                  <p className="text-xs text-gray-400">This address will be auto-selected at checkout</p>
                </div>
              </label>

              {/* Submit buttons */}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)} className="flex-1 rounded-lg border-gray-200 text-gray-600">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (editingAddress ? 'Update Address' : 'Save Address')}
                </Button>
              </div>

            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
