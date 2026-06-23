import { create } from "zustand";
import { ReminderType, VisibleReminderStatus } from "@/interfaces";

interface ReminderUiState {
  statusFilter?: VisibleReminderStatus;
  typeFilter?: ReminderType;
  petFilter?: string;
  setFilters: (filters: {
    status?: VisibleReminderStatus;
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
