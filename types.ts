

export enum GenerativeMode {
  HALFTONE = 'HALFTONE', TILES = 'TILES', NOISE_MAP = 'NOISE_MAP', VORTEX = 'VORTEX', WAVE = 'WAVE',
  CELLULAR = 'CELLULAR', GLITCH = 'GLITCH', STRIPES = 'STRIPES', CONCENTRIC = 'CONCENTRIC', BRUTALIST = 'BRUTALIST',
  BINARY = 'BINARY', KINETIC = 'KINETIC', FLOW = 'FLOW', ORGANIC = 'ORGANIC', MOSAIC = 'MOSAIC',
  RADAR = 'RADAR', SCANLINE = 'SCANLINE', CHECKER = 'CHECKER', DIAMOND = 'DIAMOND', CROSS = 'CROSS',
  ZIGZAG = 'ZIGZAG', PULSE = 'PULSE', ISOMETRIC = 'ISOMETRIC', PRIMITIVE = 'PRIMITIVE', VOID = 'VOID',
  SPIRAL = 'SPIRAL', LATTICE = 'LATTICE', PIXELATE = 'PIXELATE', FRACTURE = 'FRACTURE', ORBIT = 'ORBIT',
  // Fix: Added missing STRATIFIED mode to GenerativeMode enum to resolve compilation error in useGenerator.ts
  NEON = 'NEON', DUO_TONE = 'DUO_TONE', SKEW = 'SKEW', MIRROR = 'MIRROR', TOPOLOGY = 'TOPOLOGY', STRATIFIED = 'STRATIFIED',
  RECURSIVE = 'RECURSIVE', PARTICLE = 'PARTICLE', METABALL = 'METABALL', FLUX = 'FLUX', PHASOR = 'PHASOR',
  INTERFERENCE = 'INTERFERENCE', KALEIDOSCOPE = 'KALEIDOSCOPE', DOT_MATRIX = 'DOT_MATRIX', SHATTER = 'SHATTER', PLASMA = 'PLASMA',
  CRYSTAL = 'CRYSTAL', ORIGAMI = 'ORIGAMI', WEAVE = 'WEAVE', LABYRINTH = 'LABYRINTH', ECHO = 'ECHO',
  // New Styles to reach 100
  MOIRE = 'MOIRE', VORONOI = 'VORONOI', FLUID = 'FLUID', STRING_THEORY = 'STRING_THEORY', ASCII = 'ASCII',
  BLUEPRINT = 'BLUEPRINT', SEISMIC = 'SEISMIC', RETRO_CRT = 'RETRO_CRT', MATRIX = 'MATRIX', VECTOR_FIELD = 'VECTOR_FIELD',
  GRAVITY = 'GRAVITY', ORBITALS = 'ORBITALS', SUPERNOVA = 'SUPERNOVA', QUASAR = 'QUASAR', NEBULA = 'NEBULA',
  SAWTOOTH = 'SAWTOOTH', TRIANGULATION = 'TRIANGULATION', LOW_POLY = 'LOW_POLY', URBAN_GRID = 'URBAN_GRID', CIRCUITRY = 'CIRCUITRY',
  DNA = 'DNA', MOLECULE = 'MOLECULE', ATOMS = 'ATOMS', SPECTRUM = 'SPECTRUM', PRISM = 'PRISM',
  CHROMATIC = 'CHROMATIC', DIFFUSION = 'DIFFUSION', STIPPLE = 'STIPPLE', HATCHING = 'HATCHING', CROSS_HATCH = 'CROSS_HATCH',
  WOOD_GRAIN = 'WOOD_GRAIN', MARBLE = 'MARBLE', SAND = 'SAND', WIND = 'WIND', RAIN = 'RAIN',
  SNOW = 'SNOW', FIRE = 'FIRE', SMOKE = 'SMOKE', CLOUD = 'CLOUD', LIGHTNING = 'LIGHTNING',
  AURORA = 'AURORA', SOLAR_FLARE = 'SOLAR_FLARE', BLACK_HOLE = 'BLACK_HOLE', QUARTZ = 'QUARTZ', OBSIDIAN = 'OBSIDIAN',
  FROST = 'FROST', MAGMA = 'MAGMA', CORAL = 'CORAL', FOSSIL = 'FOSSIL', AMBER = 'AMBER'
}

export enum TileShape {
  TRIANGLE = 'TRIANGLE',
  ARC = 'ARC',
  LINE = 'LINE',
  SQUARE = 'SQUARE'
}

export interface SlotSettings {
  mode: GenerativeMode;
  cols: number;
  rows: number;
  gap: number;
  scale: number;
  seed: number;
  bgColor: string;
  fgColor: string;
  text: string;
  textX: number;
  textY: number;
  textSize: number;
  textColor: string;
  textRotation: number;
  fontFamily: string;
}

export interface DesignConfig {
  slots: SlotSettings[]; 
  activeSlot: number;
  canvasWidth: number;
  canvasHeight: number;
  tileShape: TileShape;
  showGrid: boolean;
  showTypography: boolean;
  grainIntensity: number;
  isAiLoading: boolean;
  exportTransparent: boolean;
}

export interface GridPoint {
  x: number;
  y: number;
  size: number;
  rotation: number;
  shape: TileShape;
}
