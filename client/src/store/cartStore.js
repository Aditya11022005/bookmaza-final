import { create } from 'zustand';

const useCartStore = create((set) => ({
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  
  addToCart: (item) => set((state) => {
    const existingItem = state.cartItems.find(x => x.book === item.book && x.format === item.format);
    let newItems;
    if (existingItem) {
      newItems = state.cartItems.map(x => x.book === existingItem.book && x.format === existingItem.format ? item : x);
    } else {
      newItems = [...state.cartItems, item];
    }
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    return { cartItems: newItems };
  }),

  removeFromCart: (id, format) => set((state) => {
    const newItems = state.cartItems.filter(x => !(x.book === id && x.format === format));
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    return { cartItems: newItems };
  }),
  
  clearCart: () => {
    localStorage.removeItem('cartItems');
    set({ cartItems: [] });
  }
}));

export default useCartStore;
