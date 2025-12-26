
import { GenerativeMode, GridPoint, TileShape } from '../types';
import { Random } from '../utils/noise';

export const generatePoints = (
  mode: GenerativeMode,
  width: number,
  height: number,
  config: { cols: number, rows: number, gap: number, scale: number, seed: number, tileShape: TileShape }
): GridPoint[] => {
  const points: GridPoint[] = [];
  const rng = new Random(config.seed);
  
  const safeCols = Math.max(1, config.cols);
  const safeRows = Math.max(1, config.rows);
  const cellW = width / safeCols;
  const cellH = height / safeRows;
  
  // Obtenemos el índice del modo para inyectar "variedad obligatoria" en las funciones matemáticas
  const modeIdx = Object.values(GenerativeMode).indexOf(mode);
  
  const getNoise = (nx: number, ny: number, freq: number = 4.0) => {
    // Usamos el modeIdx para que la frecuencia base cambie entre estilos
    const customFreq = freq + (modeIdx % 10);
    const s = (config.seed + modeIdx * 1000) * 0.005;
    const v1 = Math.sin(nx * customFreq + s) * Math.cos(ny * customFreq - s);
    const v2 = Math.sin(nx * customFreq * 2.5 + ny * 1.5 + s);
    return (v1 * 0.6 + v2 * 0.4 + 1) / 2;
  };

  const cx = 0.5, cy = 0.5;

  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      const nX = (c + 0.5) / safeCols;
      const nY = (r + 0.5) / safeRows;
      const val = getNoise(nX, nY);
      const intensity = Math.pow(val, 2);
      
      let x = nX * width, y = nY * height;
      let size = (Math.min(cellW, cellH) - config.gap) * config.scale;
      let rot = 0;
      let shape = config.tileShape;

      const dist = Math.sqrt((nX-cx)**2 + (nY-cy)**2);
      const angle = Math.atan2(nY-cy, nX-cx);

      // Lógica específica para grupos de estilos para maximizar variedad
      if (modeIdx < 10) { // Estilos Base (Halftone, Vortex, etc)
        switch (mode) {
          case GenerativeMode.HALFTONE:
            size *= (1.2 - dist * 2) * intensity * 2;
            shape = TileShape.SQUARE;
            break;
          case GenerativeMode.VORTEX:
            rot = angle * 180 / Math.PI + (val * 720);
            size *= intensity;
            break;
          default:
            rot = val * 360;
            break;
        }
      } else if (modeIdx < 30) { // Estilos Geométricos
        switch (mode) {
          case GenerativeMode.BRUTALIST:
            size *= (nX % 0.2 < 0.05 || nY % 0.2 < 0.05) ? 4 : 0.1;
            shape = TileShape.SQUARE;
            break;
          case GenerativeMode.ISOMETRIC:
            rot = 30 + (Math.floor(val * 3) * 60);
            shape = TileShape.TRIANGLE;
            break;
          case GenerativeMode.STRIPES:
            size *= (Math.sin(nX * 50) > 0 ? 1 : 0);
            shape = TileShape.LINE;
            break;
          default:
            rot = (nX + nY) * 180;
            break;
        }
      } else if (modeIdx < 60) { // Estilos Orgánicos y Fluidos
        switch (mode) {
          case GenerativeMode.FLOW:
            x += Math.cos(val * Math.PI * 4) * 30;
            y += Math.sin(val * Math.PI * 4) * 30;
            break;
          case GenerativeMode.DNA:
            x += Math.sin(nY * 12 + modeIdx) * 50;
            size *= 0.5 + Math.cos(nY * 12) * 0.5;
            break;
          case GenerativeMode.AURORA:
            y += Math.sin(nX * 10 + config.seed) * 80;
            shape = TileShape.LINE;
            size *= intensity * 5;
            break;
          default:
            size *= (Math.sin(dist * 20) + 1);
            break;
        }
      } else { // Estilos Abstractos y Digitales (60-100)
        switch (mode) {
          case GenerativeMode.MATRIX:
            size *= (rng.next() > 0.9 ? val * 8 : 0);
            shape = TileShape.SQUARE;
            break;
          case GenerativeMode.GLITCH:
            if(rng.next() > 0.8) { x += (rng.next()-0.5)*100; size *= 6; rot = rng.next()*360; }
            else size = 0;
            break;
          case GenerativeMode.BLACK_HOLE:
            size *= 1 / (dist + 0.01) * 0.05;
            rot = dist * 2000;
            break;
          case GenerativeMode.CIRCUITRY:
            rot = Math.floor(val * 4) * 90;
            size *= val > 0.5 ? 2.5 : 0.1;
            break;
          default:
            // Fallback ultra-caótico para los otros estilos
            const chaoticAngle = angle + (modeIdx * 0.5);
            rot = val * 360 + modeIdx * 10;
            size *= Math.abs(Math.sin(dist * 100 + chaoticAngle)) * 2;
            break;
        }
      }
      
      points.push({ x, y, size: Math.max(0, size), rotation: rot, shape });
    }
  }
  return points;
};
