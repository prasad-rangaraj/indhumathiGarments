import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Footer from '../components/Footer';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import { useAuthStore } from '../stores/authStore';
import { userAPI, customerAPI, ordersAPI, wishlistAPI, couponsAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Loader2, User, MapPin, Package, Heart, LogOut, ChevronRight, ChevronLeft, Save, Plus, Trash2, Edit2, Ticket, Headphones, RotateCcw } from 'lucide-react';
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

const OrderCard = ({ order, navigate }: { order: any; navigate: any }) => (
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
        <p className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-pink-600 transition-colors truncate">Order #{order.orderId}</p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{order.items?.length || 0} Items • ₹{order.total}</p>

        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-y-1 sm:gap-y-2 gap-x-3 sm:gap-x-4">
          {order.status === 'Delivered' ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-500">
                Delivered on {(() => {
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
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Delivery:</span>
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
        View Details
      </Button>
      <Button
        size="sm"
        className="text-xs h-8 px-3 flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 font-bold"
        onClick={() => navigate(`/track/${order.orderId}`)}
      >
        Track Order
      </Button>
    </div>
  </div>
);

export default function Profile() {
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
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await userAPI.updatePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      toast({ title: "Success", description: "Password updated successfully!" });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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

          {/* LEFT SIDEBAR (FLIPKART STYLE) */}
          <div className={`w-full md:w-1/4 space-y-4 ${!showMobileMenu ? 'hidden md:block' : 'block'}`}>
            {/* Header Box */}
            <div className="bg-white rounded-md shadow-sm p-4 flex items-center gap-4 border border-pink-100">
              <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500">Hello,</p>
                <h2 className="font-bold text-gray-800">{user.name}</h2>
              </div>
            </div>

            {/* Menu Box */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden border border-pink-100">
              <div className="py-5 px-4 border-b border-pink-50">
                <div className="flex items-center gap-3 text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider">
                  <User size={18} className="text-pink-500" /> Account Settings
                </div>
                <div className="pl-8 space-y-3 mt-3">
                  <button onClick={() => navigate('/profile?tab=profile')} className={`block w-full text-left text-sm transition-colors ${activeTab === 'profile' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-pink-600'}`}>Profile Information</button>
                  <button onClick={() => navigate('/profile?tab=addresses')} className={`block w-full text-left text-sm transition-colors ${activeTab === 'addresses' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-pink-600'}`}>Manage Addresses</button>
                  <button onClick={() => navigate('/profile?tab=security')} className={`block w-full text-left text-sm transition-colors ${activeTab === 'security' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-pink-600'}`}>Security & Password</button>
                </div>
              </div>

              <div className="py-5 px-4 border-b border-pink-50 cursor-pointer hover:bg-pink-50/30 transition-colors" onClick={() => navigate('/profile?tab=coupons')}>
                <div className={`flex items-center justify-between text-sm ${activeTab === 'coupons' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 font-medium'}`}>
                  <div className="flex items-center gap-3">
                    <Ticket size={18} className="text-pink-500" /> My Coupons
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="py-5 px-4 border-b border-pink-50 cursor-pointer hover:bg-pink-50/30 transition-colors" onClick={() => navigate('/profile?tab=orders')}>
                <div className={`flex items-center justify-between text-sm ${activeTab === 'orders' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 font-medium'}`}>
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-pink-500" /> My Orders
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="py-5 px-4 border-b border-pink-50 cursor-pointer hover:bg-pink-50/30 transition-colors" onClick={() => navigate('/profile?tab=wishlist')}>
                <div className={`flex items-center justify-between text-sm ${activeTab === 'wishlist' && !showMobileMenu ? 'text-pink-600 font-bold' : 'text-gray-600 font-medium'}`}>
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-pink-500" /> My Wishlist
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="py-5 px-4 border-b border-pink-50 cursor-pointer hover:bg-pink-50/30 transition-colors" onClick={() => navigate('/contact')}>
                <div className={`flex items-center justify-between text-sm text-gray-600 font-medium`}>
                  <div className="flex items-center gap-3">
                    <Headphones size={18} className="text-pink-500" /> Help & Support
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="py-5 px-4 cursor-pointer hover:bg-red-50/50 transition-colors group" onClick={handleLogout}>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <LogOut size={18} className="text-pink-500" /> Logout
                </div>
              </div>
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
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-pink-100 pb-4">Personal Information <span className="text-pink-600 text-sm font-bold cursor-pointer ml-4">Edit</span></h2>
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
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "SAVE CHANGES"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security View */}
              {activeTab === 'security' && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold mb-6 border-b border-pink-100 pb-4">Security Settings</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full sm:w-2/3 border border-pink-200 rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank if you logged in via Google and are setting a password for the first time.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full sm:w-2/3 border border-pink-200 rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full sm:w-2/3 border border-pink-200 rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 font-bold px-8">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "UPDATE PASSWORD"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Manage Addresses View */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Manage Addresses</h2>
                    <Button
                      onClick={() => {
                        if (addresses.length >= 5) {
                          toast({ title: 'Limit Reached', description: 'You can only store up to 5 multiple addresses.', variant: 'destructive' });
                          return;
                        }
                        setEditingAddress(null);
                        setAddressForm({ name: '', phone: '', address: '', city: '', state: '', district: '', landmark: '', pincode: '', isDefault: addresses.length === 0 });
                        setIsAddressModalOpen(true);
                      }}
                      variant="outline"
                      className="text-pink-600 border-pink-200 hover:bg-pink-50 rounded-sm font-bold"
                    >
                      <Plus size={16} className="mr-2" /> ADD A NEW ADDRESS
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-pink-600" size={32} /></div>
                  ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <MapPin size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800">No Saved Addresses</h3>
                      <p className="text-gray-500 text-sm mt-2 max-w-sm mb-6">You haven't added any delivery addresses yet. Add one now to make your next checkout faster and easier.</p>
                      <Button onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({ name: '', phone: '', address: '', city: '', state: '', district: '', landmark: '', pincode: '', isDefault: true });
                        setIsAddressModalOpen(true);
                      }} className="bg-pink-600 hover:bg-pink-700 text-white shadow-sm font-bold tracking-wide rounded-sm px-6">
                        + ADD NEW ADDRESS
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr: any) => (
                        <div key={addr.id} className="border border-pink-100 rounded-xl p-5 relative hover:shadow-md transition-all bg-white group">
                          {addr.isDefault && <span className="absolute top-4 right-4 text-[10px] font-bold bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full border border-pink-100 tracking-wider uppercase">DEFAULT</span>}

                          <div className="absolute bottom-4 right-4 sm:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => {
                              setEditingAddress(addr);
                              setAddressForm({ name: addr.name || '', phone: addr.phone || '', address: addr.address || '', city: addr.city || '', state: addr.state || '', district: addr.district || '', landmark: addr.landmark || '', pincode: addr.pincode || '', isDefault: addr.isDefault || false });
                              const stateData = indianStatesData.states.find(s => s.state === addr.state);
                              setAvailableDistricts(stateData ? stateData.districts : (addr.district ? [addr.district] : []));
                              setIsAddressModalOpen(true);
                            }} className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors bg-white shadow-sm sm:shadow-none"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteAddress(addr.id || addr._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white shadow-sm sm:shadow-none"><Trash2 size={16} /></button>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                              <MapPin className="text-pink-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{addr.name || user.name} <span className="ml-4 font-normal text-gray-500 text-sm">{addr.phone || user.phone}</span></p>
                              <p className="text-sm text-gray-600 mt-2 max-w-md leading-relaxed">
                                {[addr.address, addr.city, addr.landmark ? `(Near ${addr.landmark})` : ''].filter(Boolean).join(', ')} <br/>
                                {[addr.district, addr.state].filter(Boolean).join(', ')} {addr.pincode && <span>- <span className="font-bold text-pink-600">{addr.pincode}</span></span>}
                              </p>
                            </div>
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
                    <h2 className="text-xl font-semibold">My Orders</h2>
                    <button
                      onClick={fetchOrders}
                      disabled={ordersLoading}
                      className="flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-800 font-semibold border border-pink-200 hover:bg-pink-50 rounded-full px-3 py-1.5 transition-all disabled:opacity-50"
                    >
                      <RotateCcw size={12} className={ordersLoading ? 'animate-spin' : ''} />
                      {ordersLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  {ordersLoading && orders.length === 0 ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-pink-600" size={32} /></div>
                  ) : error ? (
                    <div className="text-center py-10">
                      <p className="text-red-500 font-medium mb-3">Error loading orders: {error}</p>
                      <button onClick={fetchOrders} className="text-pink-600 underline text-sm">Try again</button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-pink-50/20 rounded-xl border border-dashed border-pink-200">
                      <Package className="w-12 h-12 text-pink-200 mx-auto mb-4" />
                      <p className="mb-3">No orders found.</p>
                      <button onClick={fetchOrders} disabled={ordersLoading} className="text-pink-600 underline text-sm block mx-auto mb-3">
                        {ordersLoading ? 'Checking...' : 'Click to refresh'}
                      </button>
                      <Button onClick={() => navigate('/products')} className="mt-2 bg-pink-600 hover:bg-pink-700">Explore Collection</Button>
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
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAddress} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Name</label>
                <input type="text" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Phone</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-gray-500">+91</span>
                  <input type="tel" maxLength={10} value={addressForm.phone} onChange={e => handlePhoneChange(e.target.value, setAddressForm)} className="w-full border border-gray-200 rounded-sm bg-gray-50 py-2 pl-9 pr-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" required />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-bold">Pincode</label>
              <div className="relative">
                <input type="text" value={addressForm.pincode} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setAddressForm({ ...addressForm, pincode: val });
                  if (val.length === 6) fetchPincodeDetails(val);
                }} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" required placeholder="6 digits" />
                {isFetchingPincode && <span className="absolute right-3 top-2 text-xs text-gray-400 animate-pulse">Fetching...</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">State</label>
                <Select value={addressForm.state} onValueChange={(val) => {
                  const stateData = indianStatesData.states.find(s => s.state === val);
                  setAvailableDistricts(stateData ? stateData.districts : []);
                  setAddressForm({ ...addressForm, state: val, district: '' });
                }}>
                  <SelectTrigger className="w-full h-[38px] text-sm bg-gray-50 rounded-sm border-gray-200">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStatesData.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">District</label>
                <Select value={addressForm.district} onValueChange={(val) => setAddressForm({ ...addressForm, district: val })} disabled={!addressForm.state}>
                  <SelectTrigger className="w-full h-[38px] text-sm bg-gray-50 rounded-sm border-gray-200">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-bold">Flat, House no., Building, Apartment</label>
              <textarea value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" rows={2} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Area, Street, Village</label>
                <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Landmark (Optional)</label>
                <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })} className="w-full border border-gray-200 rounded-sm bg-gray-50 p-2 text-sm focus:bg-white focus:ring-1 focus:ring-pink-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-pink-600 w-4 h-4" />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">Set as Default Address</label>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Address'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
