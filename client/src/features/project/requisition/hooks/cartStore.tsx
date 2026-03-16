import { create } from "zustand";

export type CartItem = {
    catalogueId: string;
    supplierId: string;
    name: string;
    supplierName: string;
    unit: string;
    rate: number;
    quantity: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: ({
        catalogueId,
        supplierId,
    }: {
        catalogueId: string;
        supplierId: string;
    }) => void;
    updateQuantity: ({
        catalogueId,
        supplierId,
        quantity,
    }: {
        catalogueId: string;
        supplierId: string;
        quantity: number;
    }) => void;
    clearCart: () => void;

    getTotalCost: () => number;
};

export const useCartData = create<CartStore>((set, get) => ({
    items: [],
    addItem: (newItem) =>
        set((state) => {
            const existingItem = state.items.find(
                (item) =>
                    item.catalogueId === newItem.catalogueId &&
                    item.supplierId === newItem.supplierId,
            );

            if (existingItem) {
                return {
                    items: state.items.map((item) =>
                        item.catalogueId === newItem.catalogueId &&
                        item.supplierId === newItem.supplierId
                            ? {
                                  ...item,
                                  quantity: item.quantity + newItem.quantity,
                              }
                            : item,
                    ),
                };
            }
            return {
                items: [...state.items, newItem],
            };
        }),
    removeItem: ({ catalogueId, supplierId }) =>
        set((state) => ({
            items: state.items.filter(
                (item) =>
                    item.catalogueId !== catalogueId ||
                    item.supplierId !== supplierId,
            ),
        })),

    updateQuantity: ({ catalogueId, supplierId, quantity }) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.catalogueId === catalogueId &&
                item.supplierId === supplierId
                    ? { ...item, quantity }
                    : item,
            ),
        })),

    clearCart: () => set({ items: [] }),
    getTotalCost: () => {
        return get().items.reduce(
            (total, item) => total + item.rate * item.quantity,
            0,
        );
    },
}));
