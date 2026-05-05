import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const Cart = () => {
  const { items, total, updateQuantity, removeItem, fetchCart } = useCartStore();
  const { toast } = useToast();

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await updateQuantity(id, quantity);
    } catch {
      toast({ title: 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch {
      toast({ title: 'Failed to remove item', variant: 'destructive' });
    }
  };


  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex items-center justify-center px-4 min-h-screen">
          <div className="text-center animate-fade-in">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Add some beautiful cotton lingerie to get started!</p>
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground animate-fade-in">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {items.map((item, index) => (
              <div 
                key={`${item.id}-${item.selectedSize}`}
                className="card-elegant p-4 sm:p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0 bg-accent/70 border border-border flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "No Image"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{item.category}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border hover:border-primary transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border hover:border-primary transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        <span className="font-bold text-primary text-base sm:text-lg">₹{item.price * item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-6 sticky top-24 animate-fade-in">
              <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              <Link 
                to="/checkout" 
                className="btn-primary w-full text-center block hover-glow"
              >
                Proceed to Checkout
              </Link>
              
              <Link 
                to="/products" 
                className="btn-secondary w-full text-center block mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;