
import React, { useState, useRef } from 'react';
import { useDesignStore } from '../store';
import { GenerativeMode, TileShape } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RefreshCcw, Box, Hexagon, Waves, Sliders, Layout, Monitor, Circle, Square, 
  Triangle, Zap, Target, Activity, Hash, Layers, Sparkles, Type as TypeIcon, Image as ImageIcon, Download, Move, Upload, RotateCcw, Palette, Grid
} from 'lucide-react';

const MODE_DEFS = Object.values(GenerativeMode).map(id => {
  let Icon = Box;
  if (id.includes('WAVE') || id.includes('FLOW')) Icon = Waves;
  if (id.includes('CELL') || id.includes('LATTICE')) Icon = Hexagon;
  if (id.includes('HALFT') || id.includes('DOT')) Icon = Circle;
  if (id.includes('GLITCH') || id.includes('SHATTER')) Icon = Zap;
  if (id.includes('BRUTAL') || id.includes('TILES')) Icon = Square;
  if (id.includes('RADAR') || id.includes('CONCEN')) Icon = Target;
  if (id.includes('PULSE') || id.includes('KINET')) Icon = Activity;
  if (id.includes('BINARY') || id.includes('CROSS')) Icon = Hash;
  if (id.includes('TOPOL') || id.includes('STRAT')) Icon = Layers;

  return { id, label: id.replace(/_/g, ' '), icon: Icon };
});

const GOOGLE_FONTS = [
  { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Syne', value: "'Syne', sans-serif" },
  { name: 'Unbounded', value: "'Unbounded', sans-serif" },
  { name: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
];

const STANDARD_ANGLES = [0, 45, 90, 180, 270];

export const Sidebar: React.FC = () => {
  const store = useDesignStore();
  const currentSlot = store.slots[store.activeSlot];
  const [aiPrompt, setAiPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiCurate = async () => {
    if (!aiPrompt.trim()) return;
    store.setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // PROMPT MAESTRO PARA VARIEDAD RADICAL
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `ERES UN ARTISTA GENERATIVO EXPERIMENTAL. 
        Usuario pide: "${aiPrompt}".
        MISIÓN: Generar una propuesta ÚNICA y DISRUPTIVA para el módulo M${store.activeSlot + 1}.
        REGLA CRÍTICA: NO USES estilos comunes como HALFTONE o BRUTALIST a menos que sea necesario. Explora los 100 modos.
        Si el usuario repite la palabra, TÚ cambia drásticamente el enfoque (ej: de orgánico a digital, de denso a minimalista).
        
        Configuración requerida:
        1. Modo de los 100 disponibles: [${Object.values(GenerativeMode).join(', ')}].
        2. Forma de azulejo: [TRIANGLE, ARC, LINE, SQUARE].
        3. Densidad (cols/rows): Entre 10 y 150 (sé atrevido).
        4. Escala (scale): Entre 0.5 y 4.5.
        5. Paleta de colores: Evita siempre el blanco/negro básico. Usa colores vibrantes, ácidos o brutales.
        
        Devuelve SOLO JSON: {
          "mode": string, 
          "tileShape": string,
          "fgColor": string (hex), 
          "bgColor": string (hex), 
          "seed": number (usa un numero muy grande), 
          "scale": number, 
          "gap": number (0 a 10), 
          "text": string (radical), 
          "fontFamily": string, 
          "textRotation": number,
          "cols": number,
          "rows": number
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mode: { type: Type.STRING },
              tileShape: { type: Type.STRING },
              fgColor: { type: Type.STRING },
              bgColor: { type: Type.STRING },
              seed: { type: Type.INTEGER },
              scale: { type: Type.NUMBER },
              gap: { type: Type.NUMBER },
              text: { type: Type.STRING },
              fontFamily: { type: Type.STRING },
              textRotation: { type: Type.NUMBER },
              cols: { type: Type.INTEGER },
              rows: { type: Type.INTEGER }
            },
            required: ["mode", "tileShape", "fgColor", "bgColor", "seed", "scale", "gap", "text", "fontFamily", "textRotation", "cols", "rows"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const fontMatch = GOOGLE_FONTS.find(f => f.name === result.fontFamily);
      if (fontMatch) result.fontFamily = fontMatch.value;
      
      store.updateFromAi(result);
      if (result.cols) store.setCols(result.cols);
      if (result.rows) store.setRows(result.rows);
      if (result.tileShape) store.setTileShape(result.tileShape as TileShape);
    } catch (e) {
      console.error("Error en Curador IA", e);
    } finally {
      store.setAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fontName = `CustomFont_${Date.now()}`;
        const fontFace = new FontFace(fontName, event.target?.result as ArrayBuffer);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
        store.updateTextSettings({ fontFamily: fontName });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = (idx: number | 'MASTER', format: 'SVG' | 'PNG') => {
    window.dispatchEvent(new CustomEvent('export-collage-slot', { detail: { slotIndex: idx, format } }));
  };

  return (
    <div className="w-80 h-full bg-[#0a0a0a] border-r border-[#222] flex flex-col overflow-hidden z-20 shadow-2xl">
      <div className="p-6 border-b border-[#222] flex items-center justify-between bg-black">
        <div>
          <h1 className="text-xl font-bold tracking-tighter mono text-white">SWISS_GRID</h1>
          <p className="text-[9px] text-zinc-500 mono tracking-widest uppercase font-bold">RADICAL_EXPLORER_V7</p>
        </div>
        <button onClick={() => store.reset()} className="p-2 hover:bg-white hover:text-black rounded-full transition-all text-zinc-600">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* AI EXPLORATORY CURATOR */}
        <section className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-3 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={14} className="animate-pulse" />
            <label className="text-[10px] uppercase tracking-widest font-black">Curador IA Exploratorio</label>
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="Escribe 'Panela', 'Cibernética'..." 
              className="flex-1 bg-black border border-indigo-500/20 rounded px-2 py-1.5 text-xs mono text-indigo-100 outline-none focus:border-indigo-500 placeholder:text-indigo-900/50"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiCurate()}
            />
            <button 
              disabled={store.isAiLoading}
              onClick={handleAiCurate}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-all shadow-lg active:scale-90"
            >
              <RefreshCcw size={12} className={store.isAiLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </section>

        {/* Module focus */}
        <section>
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 block">Control de Módulo</label>
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => store.setActiveSlot(idx)}
                className={`h-10 border transition-all rounded text-[11px] mono font-bold ${
                  store.activeSlot === idx ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-[#222] text-zinc-600 hover:border-zinc-400'
                }`}
              >
                M{idx + 1}
              </button>
            ))}
          </div>
        </section>

        {/* GRID DENSITY & SCALE - RESTORED AND IMPROVED */}
        <section className="space-y-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800">
           <div className="flex items-center gap-2 text-white mb-2">
              <Grid size={14} />
              <label className="text-[10px] uppercase tracking-widest font-black">Estructura y Densidad</label>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase text-zinc-500">
                  <span>Columnas / Filas</span>
                  <span className="text-white mono font-bold">{currentSlot.cols}</span>
                </div>
                <input 
                  type="range" min="2" max="200" 
                  value={currentSlot.cols} 
                  onChange={(e) => { store.setCols(Number(e.target.value)); store.setRows(Number(e.target.value)); }} 
                  className="w-full h-1 bg-zinc-800 rounded appearance-none accent-white cursor-pointer" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase text-zinc-500">
                  <span>Escala de Elemento</span>
                  <span className="text-white mono font-bold">{currentSlot.scale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="10.0" step="0.1" 
                  value={currentSlot.scale} 
                  onChange={(e) => store.setScale(Number(e.target.value))} 
                  className="w-full h-1 bg-zinc-800 rounded appearance-none accent-white cursor-pointer" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase text-zinc-500">
                  <span>Hueco (Gap)</span>
                  <span className="text-white mono font-bold">{currentSlot.gap}px</span>
                </div>
                <input 
                  type="range" min="0" max="30" 
                  value={currentSlot.gap} 
                  onChange={(e) => store.setGap(Number(e.target.value))} 
                  className="w-full h-1 bg-zinc-800 rounded appearance-none accent-white cursor-pointer" 
                />
              </div>
            </div>
        </section>

        {/* COLOR LAB - REDESIGNED */}
        <section className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
           <div className="flex items-center gap-2 text-white mb-2">
              <Palette size={14} />
              <label className="text-[10px] uppercase tracking-widest font-black">Laboratorio de Color</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-500 uppercase block">Tinta (FG)</label>
                <div className="flex items-center gap-2 bg-black border border-zinc-800 p-2 rounded-lg group hover:border-zinc-500 transition-all cursor-pointer">
                  <input 
                    type="color" 
                    value={currentSlot.fgColor} 
                    onChange={(e) => store.setColors(currentSlot.bgColor, e.target.value)} 
                    className="w-6 h-6 bg-transparent cursor-pointer rounded overflow-hidden" 
                  />
                  <span className="mono text-[10px] text-zinc-400 uppercase font-bold">{currentSlot.fgColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-500 uppercase block">Papel (BG)</label>
                <div className="flex items-center gap-2 bg-black border border-zinc-800 p-2 rounded-lg group hover:border-zinc-500 transition-all cursor-pointer">
                  <input 
                    type="color" 
                    value={currentSlot.bgColor} 
                    onChange={(e) => store.setColors(e.target.value, currentSlot.fgColor)} 
                    className="w-6 h-6 bg-transparent cursor-pointer rounded overflow-hidden" 
                  />
                  <span className="mono text-[10px] text-zinc-400 uppercase font-bold">{currentSlot.bgColor}</span>
                </div>
              </div>
            </div>
        </section>

        {/* Floating Typography */}
        <section className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <TypeIcon size={14} />
              <label className="text-[10px] uppercase tracking-widest font-black">Tipografía Flotante</label>
            </div>
            <input 
              type="checkbox" 
              checked={store.showTypography} 
              onChange={(e) => store.setTypography(e.target.checked)}
              className="accent-white cursor-pointer w-4 h-4"
            />
          </div>
          
          {store.showTypography && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1">
                 <input 
                  value={currentSlot.text}
                  onChange={(e) => store.updateTextSettings({ text: e.target.value })}
                  placeholder="Texto del módulo..."
                  className="w-full bg-black border border-[#333] px-3 py-2 text-xs mono rounded outline-none text-white font-bold focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] text-zinc-500 uppercase">Fuente</label>
                 <select 
                   value={currentSlot.fontFamily}
                   onChange={(e) => store.updateTextSettings({ fontFamily: e.target.value })}
                   className="w-full bg-black border border-[#333] px-2 py-1.5 text-xs mono rounded text-white cursor-pointer outline-none focus:border-zinc-500"
                 >
                   {GOOGLE_FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                   <option value={currentSlot.fontFamily} hidden>Actual / Custom</option>
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Color Texto</label>
                    <input type="color" value={currentSlot.textColor} onChange={(e) => store.updateTextSettings({ textColor: e.target.value })} className="w-full h-8 bg-black cursor-pointer rounded border border-[#333]" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Tamaño</label>
                    <input type="number" value={currentSlot.textSize} onChange={(e) => store.updateTextSettings({ textSize: Number(e.target.value) })} className="w-full bg-black border border-[#333] px-2 py-1 text-xs mono rounded outline-none text-white" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] text-zinc-500 uppercase flex items-center gap-2"><RotateCcw size={10}/> Ángulo</label>
                 <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    {STANDARD_ANGLES.map(angle => (
                      <button
                        key={angle}
                        onClick={() => store.updateTextSettings({ textRotation: angle })}
                        className={`px-2 py-1 text-[9px] mono border rounded transition-all flex-1 min-w-[36px] ${
                          currentSlot.textRotation === angle ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'
                        }`}
                      >
                        {angle}°
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </section>

        {/* 100 Styles Grid */}
        <section>
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 block underline decoration-zinc-800 underline-offset-4">100 Maestros Visuales / {currentSlot.mode}</label>
          <div className="grid grid-cols-5 gap-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border border-[#222] p-2 bg-black rounded-lg">
            {MODE_DEFS.map((mode) => (
              <button
                key={mode.id}
                title={mode.label}
                onClick={() => store.setMode(mode.id)}
                className={`flex flex-col items-center justify-center p-2 border transition-all aspect-square rounded group ${
                  currentSlot.mode === mode.id ? 'bg-white text-black border-white shadow-xl scale-95' : 'border-transparent text-zinc-700 hover:text-white hover:bg-[#111]'
                }`}
              >
                <mode.icon size={12} className={`mb-1 ${currentSlot.mode === mode.id ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                <span className="text-[5px] mono uppercase truncate w-full text-center">{mode.label.substring(0,8)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Export Section */}
        <section className="bg-white p-5 rounded-xl space-y-4 shadow-2xl">
          <label className="text-[11px] uppercase tracking-widest text-black font-black block flex items-center gap-2">
            <Monitor size={16} /> Composición Final
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleExport('MASTER', 'SVG')} className="py-2.5 bg-black text-white hover:bg-zinc-800 text-[10px] font-black uppercase rounded transition-all active:scale-95">SVG Master</button>
            <button onClick={() => handleExport('MASTER', 'PNG')} className="py-2.5 bg-zinc-200 text-black hover:bg-zinc-300 text-[10px] font-black uppercase rounded transition-all active:scale-95">PNG Master</button>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[8px] text-zinc-400 uppercase mono font-bold">Módulo Activo (M{store.activeSlot + 1})</span>
              <div className="flex gap-2">
                <button onClick={() => handleExport(store.activeSlot, 'PNG')} className="text-[8px] font-bold text-indigo-600 hover:underline">Exportar M{store.activeSlot + 1}</button>
              </div>
          </div>
        </section>
      </div>
    </div>
  );
};
