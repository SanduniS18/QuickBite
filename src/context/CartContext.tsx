import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Order, OrderStatus, UserProfile } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (pickupLocation: string, paymentMethod: string) => Order;
  cancelOrder: (orderId: string) => void;
  user: UserProfile;
  loginUser: (name: string, studentId: string, email: string) => void;
  loginAsGuest: () => void;
  logoutUser: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% campus canteen sales tax

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Johnson',
    studentId: 'STU-2026-9481',
    email: 'alex.johnson@campus.edu',
    phone: '+1 (555) 349-8201',
    isGuest: false,
  });

  // Calculate dynamic stats
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  // Auto-progress simulated active orders across status lifecycles: Placed -> Preparing -> Ready for pickup
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.status === 'Placed') {
            return { ...order, status: 'Preparing' as OrderStatus };
          } else if (order.status === 'Preparing') {
            return { ...order, status: 'Ready for pickup' as OrderStatus };
          }
          return order;
        })
      );
    }, 12000); // Transitions state every 12 seconds for testing/demo

    return () => clearInterval(timer);
  }, []);

  const addToCart = (item: MenuItem, quantity = 1, specialInstructions?: string) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(ci => ci.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          specialInstructions: specialInstructions || updated[existingIndex].specialInstructions,
        };
        return updated;
      }
      return [...prevCart, { item, quantity, specialInstructions }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(ci => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(ci => (ci.item.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (pickupLocation: string, paymentMethod: string): Order => {
    const orderNumber = `QB-${Math.floor(100000 + Math.random() * 900000)}`;
    const estMinutes = 15;
    const now = new Date();
    const pickupTimeObj = new Date(now.getTime() + estMinutes * 60000);
    const pickupTimeString = pickupTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderNumber,
      items: [...cart],
      subtotal,
      tax,
      total,
      pickupTime: pickupTimeString,
      status: 'Placed',
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickupLocation,
      paymentMethod,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const loginUser = (name: string, studentId: string, email: string) => {
    setUser({
      name,
      studentId,
      email,
      phone: '+1 (555) 123-4567',
      isGuest: false,
    });
  };

  const loginAsGuest = () => {
    setUser({
      name: 'Guest Student',
      studentId: 'GUEST-001',
      email: 'guest@campus.edu',
      phone: 'N/A',
      isGuest: true,
    });
  };

  const logoutUser = () => {
    loginAsGuest();
  };

  const activeOrder = orders.find(o => o.status !== 'Completed') || (orders.length > 0 ? orders[0] : null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        total,
        orders,
        activeOrder,
        placeOrder,
        cancelOrder,
        user,
        loginUser,
        loginAsGuest,
        logoutUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
