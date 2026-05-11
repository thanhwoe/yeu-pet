import { IShippingAddress } from "@/interfaces";
import { create } from "zustand";
import { createSelectors } from "./createSelector";

type State = {
  shippingAddress: IShippingAddress | null;
};

type Action = {
  setShippingAddress: (data: IShippingAddress) => void;
  clearShippingAddress: () => void;
};

const useShopStoreBase = create<State & Action>()((set) => ({
  shippingAddress: null,
  setShippingAddress: (data: IShippingAddress) =>
    set({ shippingAddress: data }),
  clearShippingAddress: () => set({ shippingAddress: null }),
}));

export const useShopStore = createSelectors(useShopStoreBase);
