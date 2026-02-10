import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  nickname: string;
  playerId: string;
  roomCode: string;
  isHost: boolean;
}

export interface CustomerState {
  customer: Customer | null;
}

export interface CustomerActions {
  setCustomer: (data: Customer | null) => void;
  reset: () => void;
}

export type CustomerStore = CustomerState & CustomerActions;

const initialState = {
  customer: null,
};

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      ...initialState,
      setCustomer: (data) => set({ customer: data }),
      reset: () => set(initialState),
    }),
    {
      name: 'customer-storage',
    },
  ),
);
