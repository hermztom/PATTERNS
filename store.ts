
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DesignConfig, GenerativeMode, TileShape, SlotSettings } from './types';

interface DesignStore extends DesignConfig {
  setMode: (mode: GenerativeMode) => void;
  setActiveSlot: (index: number) => void;
  setCols: (cols: number) => void;
  setRows: (rows: number) => void;
  setGap: (gap: number) => void;
  setScale: (scale: number) => void;
  setSeed: (seed: number) => void;
  setColors: (bg: string, fg: string) => void;
  setCanvasSize: (w: number, h: number) => void;
  setTileShape: (shape: TileShape) => void;
  setTypography: (show: boolean) => void;
  updateTextSettings: (settings: Partial<Pick<SlotSettings, 'text' | 'textX' | 'textY' | 'textSize' | 'textColor' | 'textRotation' | 'fontFamily'>>) => void;
  setGrain: (intensity: number) => void;
  setAiLoading: (loading: boolean) => void;
  setExportTransparent: (transparent: boolean) => void;
  updateFromAi: (config: Partial<SlotSettings>) => void;
  toggleGrid: () => void;
  reset: () => void;
}

const createDefaultSlot = (mode: GenerativeMode, seed: number, bg = '#000000', fg = '#FFFFFF'): SlotSettings => ({
  mode,
  cols: 50,
  rows: 50,
  gap: 2,
  scale: 1.0,
  seed,
  bgColor: bg,
  fgColor: fg,
  text: "GRID",
  textX: 5,
  textY: 5,
  textSize: 60,
  textColor: fg,
  textRotation: 0,
  fontFamily: "'Space Grotesk', sans-serif",
});

const getInitialState = (): DesignConfig => ({
  slots: [
    createDefaultSlot(GenerativeMode.HALFTONE, 42, '#000000', '#FFFFFF'),
    createDefaultSlot(GenerativeMode.WAVE, 142, '#111111', '#00FF00'),
    createDefaultSlot(GenerativeMode.GLITCH, 242, '#050505', '#FF00FF'),
    createDefaultSlot(GenerativeMode.BRUTALIST, 342, '#FFFFFF', '#000000'),
    createDefaultSlot(GenerativeMode.KINETIC, 442, '#0000FF', '#FFFFFF'),
  ],
  activeSlot: 0,
  canvasWidth: 1200,
  canvasHeight: 1200,
  tileShape: TileShape.TRIANGLE,
  showGrid: true,
  showTypography: true,
  grainIntensity: 0.15,
  isAiLoading: false,
  exportTransparent: false,
});

export const useDesignStore = create<DesignStore>()(
  persist(
    (set) => ({
      ...getInitialState(),
      
      setMode: (mode) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], mode };
        return { slots: nextSlots };
      }),
      setActiveSlot: (activeSlot) => set({ activeSlot }),
      setCols: (cols) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], cols };
        return { slots: nextSlots };
      }),
      setRows: (rows) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], rows };
        return { slots: nextSlots };
      }),
      setGap: (gap) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], gap };
        return { slots: nextSlots };
      }),
      setScale: (scale) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], scale };
        return { slots: nextSlots };
      }),
      setSeed: (seed) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], seed };
        return { slots: nextSlots };
      }),
      setColors: (bgColor, fgColor) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], bgColor, fgColor };
        return { slots: nextSlots };
      }),
      setCanvasSize: (canvasWidth, canvasHeight) => set({ canvasWidth, canvasHeight }),
      setTileShape: (tileShape) => set({ tileShape }),
      setTypography: (showTypography) => set({ showTypography }),
      updateTextSettings: (settings) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], ...settings };
        return { slots: nextSlots };
      }),
      setGrain: (grainIntensity) => set({ grainIntensity }),
      setAiLoading: (isAiLoading) => set({ isAiLoading }),
      setExportTransparent: (exportTransparent) => set({ exportTransparent }),
      updateFromAi: (aiConfig) => set((state) => {
        const nextSlots = [...state.slots];
        nextSlots[state.activeSlot] = { ...nextSlots[state.activeSlot], ...aiConfig };
        return { slots: nextSlots };
      }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      reset: () => {
        localStorage.removeItem('swiss-grid-storage-v4');
        set(getInitialState());
      },
    }),
    {
      name: 'swiss-grid-storage-v4',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
