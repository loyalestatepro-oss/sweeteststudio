import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudioType = "video" | "image" | "music" | "voice" | "avatar";

export interface GeneratedItem {
  id: string;
  studio: StudioType;
  prompt: string;
  preset: string;
  model: string;
  meta: string;
  createdAt: number;
  /** For image/avatar/video thumbnail: real image URL or data URI */
  imageUrl?: string;
  /** For video: ordered keyframe URLs for animated preview */
  frames?: string[];
  /** For music/voice: playable audio URL or data URI */
  audioUrl?: string | null;
  /** Gradient CSS string used as fallback background */
  gradient: string;
}

interface GenerationState {
  items: GeneratedItem[];
  addItems: (newItems: GeneratedItem[]) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      items: [],
      addItems: (newItems) =>
        set((state) => ({ items: [...newItems, ...state.items].slice(0, 100) })),
      deleteItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearAll: () => set({ items: [] }),
    }),
    { name: "nebula-generations-v2" }
  )
);
