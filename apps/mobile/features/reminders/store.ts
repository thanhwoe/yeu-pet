import { create } from "zustand";
import { ReminderStatus, ReminderType } from "@/interfaces";

interface ReminderUiState {
  statusFilter?: ReminderStatus;
  typeFilter?: ReminderType;
  petFilter?: string;
  setFilters: (filters: {
    status?: ReminderStatus;
    type?: ReminderType;
    petId?: string;
  }) => void;
  resetFilters: () => void;
}

export const useReminderUiStore = create<ReminderUiState>((set) => ({
  statusFilter: undefined,
  typeFilter: undefined,
  petFilter: undefined,
  setFilters: ({ status, type, petId }) =>
    set({ statusFilter: status, typeFilter: type, petFilter: petId }),
  resetFilters: () =>
    set({
      statusFilter: undefined,
      typeFilter: undefined,
      petFilter: undefined,
    }),
}));
