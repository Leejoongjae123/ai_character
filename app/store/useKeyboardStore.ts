import { create } from 'zustand';

interface KeyboardState {
  isOpen: boolean;
  inputBuffer: string;
  isKorean: boolean;
  openKeyboard: (initialText?: string) => void;
  closeKeyboard: () => void;
  setInputBuffer: (text: string) => void;
  toggleLanguage: () => void;
  resetKeyboard: () => void;
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  isOpen: false,
  inputBuffer: '',
  isKorean: true,
  
  openKeyboard: (initialText = '') => {
    set({ 
      isOpen: true, 
      inputBuffer: initialText 
    });
  },
  
  closeKeyboard: () => {
    set({ isOpen: false });
  },
  
  setInputBuffer: (text: string) => {
    set({ inputBuffer: text });
  },
  
  toggleLanguage: () => {
    set((state) => ({ isKorean: !state.isKorean }));
  },
  
  resetKeyboard: () => {
    set({ 
      isOpen: false, 
      inputBuffer: '', 
      isKorean: true 
    });
  }
})); 