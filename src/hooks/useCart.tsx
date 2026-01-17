import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  updateStock: (id: string, stock: number) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          // Check stock limit
          const maxQuantity = existingItem.stock ?? Infinity;
          if (existingItem.quantity >= maxQuantity) {
            return; // Don't add more if at stock limit
          }
          set({
            items: items.map(i =>
              i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + 1, maxQuantity) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          const item = get().items.find(i => i.id === id);
          const maxQuantity = item?.stock ?? Infinity;
          set({
            items: get().items.map(i =>
              i.id === id ? { ...i, quantity: Math.min(quantity, maxQuantity) } : i
            ),
          });
        }
      },
      
      updateStock: (id, stock) => {
        set({
          items: get().items.map(i =>
            i.id === id ? { ...i, stock, quantity: Math.min(i.quantity, stock) } : i
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
