
import { create } from 'zustand';

interface ChatbotState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useChatbot = create<ChatbotState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
