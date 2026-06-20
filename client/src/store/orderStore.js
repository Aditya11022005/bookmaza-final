import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
  persist(
    (set) => ({
      orders: [],
      library: [],

      addOrder: (orderData, cartItems, customId = null) => {
        let generatedOrderId = customId || `ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
        
        set((state) => {
          const newOrder = {
            ...orderData,
            id: generatedOrderId,
            _id: generatedOrderId,
            date: new Date().toISOString(),
            items: cartItems,
          };

          // Extract digital items for library
          const newLibraryItems = cartItems
            .filter(item => {
              const fmt = item.format?.toLowerCase();
              return fmt === 'ebook' || fmt === 'audiobook';
            })
            .map(item => ({
              id: `lib_${Math.random().toString(36).substring(2, 8)}`,
              type: item.format === 'Ebook' ? 'read' : 'listen',
              title: item.title,
              author: item.author || 'Pustak Maza Author',
              format: item.format,
              progress: 0,
              lastAccessed: new Date().toISOString(),
              coverImage: item.image,
              bookId: item.book
            }));

          return {
            orders: [newOrder, ...state.orders],
            library: [...newLibraryItems, ...state.library]
          };
        });

        return generatedOrderId;
      },
      
      clearOrders: () => set({ orders: [], library: [] })
    }),
    {
      name: 'order-storage'
    }
  )
);

export default useOrderStore;
