import { create } from 'zustand';

interface AudioState {
  isMuted: boolean;
  isIntroPlaying: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setIntroPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  isIntroPlaying: false,
  setMuted: (muted) => set({ isMuted: muted }),
  toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
  setIntroPlaying: (playing) => set({ isIntroPlaying: playing }),
})); 