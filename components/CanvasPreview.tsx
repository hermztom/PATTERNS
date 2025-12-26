
import React, { useRef, useEffect, useMemo } from 'react';
import { useDesignStore } from '../store';
import { generatePoints } from '../hooks/useGenerator';
import { GridPoint, TileShape, SlotSettings } from '../types';

export const CanvasPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useDesignStore();

  const collageLayout = useMemo(() => {
    const { canvasWidth, canvasHeight, activeSlot } = store;
    const mainWidth = canvasWidth * 0.7;
    const sideWidth = canvasWidth * 0.3;
    const sideHeight = canvasHeight / 4;

    const layout: any[] = [];
    const others = [0, 1, 2, 3, 4].filter(i => i !== activeSlot);

    layout.push({ slotIdx: activeSlot, x: 0, y: 0, w: mainWidth, h: canvasHeight, isMain: true });
    others.forEach((slotIdx, i) => {
      layout.push({ slotIdx, x: mainWidth, y: i * sideHeight, w: sideWidth, h: sideHeight, isMain: false });
    });

    return layout;
  }, [store.canvasWidth, store.canvasHeight, store.activeSlot]);

  const applyGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    if (intensity <= 0) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * intensity * 255;
      data[i] += grain;
      data[i+1] += grain;
      data[i+2] += grain;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const drawShape = (ctx: CanvasRenderingContext2D, p: GridPoint, fg: string) => {
    if (Number.isNaN(p.x) || Number.isNaN(p.y) || p.size <= 0.001) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    const s = p.size;
    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    ctx.lineWidth = Math.max(0.5, s * 0.12);

    switch (p.shape) {
      case TileShape.SQUARE:
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case TileShape.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(-s / 2, -s / 2);
        ctx.lineTo(s / 2, -s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case TileShape.ARC:
        ctx.beginPath();
        ctx.arc(-s / 2, -s / 2, s, 0, Math.PI / 2);
        ctx.lineTo(-s / 2, -s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case TileShape.LINE:
        ctx.beginPath();
        ctx.moveTo(-s / 2, 0);
        ctx.lineTo(s / 2, 0);
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    collageLayout.forEach((item) => {
      const settings = store.slots[item.slotIdx];
      const points = generatePoints(settings.mode, item.w, item.h, {
        cols: settings.cols, rows: settings.rows, gap: settings.gap, 
        scale: settings.scale, seed: settings.seed, tileShape: store.tileShape
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(item.x, item.y, item.w, item.h);
      ctx.clip();

      ctx.translate(item.x, item.y);
      ctx.fillStyle = settings.bgColor;
      ctx.fillRect(0, 0, item.w, item.h);

      points.forEach(p => drawShape(ctx, p, settings.fgColor));
      
      // Floating Typography Box
      if (store.showTypography && settings.text) {
        ctx.save();
        ctx.fillStyle = settings.textColor;
        ctx.font = `bold ${settings.textSize}px ${settings.fontFamily}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.translate(item.w * (settings.textX / 100), item.h * (settings.textY / 100));
        ctx.rotate((settings.textRotation * Math.PI) / 180);
        ctx.fillText(settings.text, 0, 0);
        ctx.restore();
      }

      // Technical Label
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.fillStyle = settings.fgColor;
      ctx.globalAlpha = 0.4;
      ctx.font = '7px "Space Mono"';
      ctx.fillText(`M_${item.slotIdx + 1}:${settings.mode}`, 8, item.h - 10);
      ctx.restore();

      ctx.strokeStyle = settings.fgColor;
      ctx.globalAlpha = 0.15;
      ctx.strokeRect(item.x, item.y, item.w, item.h);
      
      if (item.isMain) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x, item.y, item.w, item.h);
      }
      ctx.restore();
    });

    applyGrain(ctx, canvas.width, canvas.height, store.grainIntensity);

  }, [collageLayout, store]);

  const processExport = (slotIdx: number | 'MASTER', format: 'SVG' | 'PNG') => {
    const qualityScale = 4;
    const isMaster = slotIdx === 'MASTER';
    const isTransparent = store.exportTransparent && !isMaster;

    let exportW, exportH;
    if (isMaster) {
      exportW = store.canvasWidth * qualityScale;
      exportH = store.canvasHeight * qualityScale;
    } else {
      const layoutItem = collageLayout.find(li => li.slotIdx === slotIdx);
      exportW = layoutItem.w * qualityScale;
      exportH = layoutItem.h * qualityScale;
    }

    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d')!;

    if (isMaster) {
      collageLayout.forEach(item => {
        const s = store.slots[item.slotIdx];
        const localW = item.w * qualityScale;
        const localH = item.h * qualityScale;
        const pts = generatePoints(s.mode, localW, localH, { ...s, tileShape: store.tileShape });
        
        ctx.save();
        ctx.translate(item.x * qualityScale, item.y * qualityScale);
        ctx.fillStyle = s.bgColor;
        ctx.fillRect(0, 0, localW, localH);
        pts.forEach(p => drawShape(ctx, { ...p, x: p.x, y: p.y, size: p.size * qualityScale }, s.fgColor));

        if (store.showTypography && s.text) {
          ctx.save();
          ctx.fillStyle = s.textColor;
          ctx.font = `bold ${s.textSize * qualityScale}px ${s.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(localW * (s.textX / 100), localH * (s.textY / 100));
          ctx.rotate((s.textRotation * Math.PI) / 180);
          ctx.fillText(s.text, 0, 0);
          ctx.restore();
        }
        ctx.restore();
      });
      applyGrain(ctx, exportW, exportH, store.grainIntensity);
    } else {
      const s = store.slots[slotIdx as number];
      const pts = generatePoints(s.mode, exportW, exportH, { ...s, tileShape: store.tileShape });
      if (!isTransparent) {
        ctx.fillStyle = s.bgColor;
        ctx.fillRect(0, 0, exportW, exportH);
      }
      pts.forEach(p => drawShape(ctx, p, s.fgColor));

      if (store.showTypography && s.text) {
        ctx.save();
        ctx.fillStyle = s.textColor;
        ctx.font = `bold ${s.textSize * qualityScale}px ${s.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(exportW * (s.textX / 100), exportH * (s.textY / 100));
        ctx.rotate((s.textRotation * Math.PI) / 180);
        ctx.fillText(s.text, 0, 0);
        ctx.restore();
      }
      applyGrain(ctx, exportW, exportH, store.grainIntensity);
    }

    if (format === 'SVG') {
      const createSvgPoints = (pts: GridPoint[], color: string, scale: number) => {
        return pts.map(p => {
          const transform = `translate(${p.x}, ${p.y}) rotate(${p.rotation})`;
          if (p.shape === TileShape.SQUARE) return `<circle cx="${p.x}" cy="${p.y}" r="${p.size/2}" fill="${color}" />`;
          if (p.shape === TileShape.TRIANGLE) return `<path d="M ${-p.size/2} ${-p.size/2} L ${p.size/2} ${-p.size/2} L ${-p.size/2} ${p.size/2} Z" fill="${color}" transform="${transform}" />`;
          if (p.shape === TileShape.LINE) return `<line x1="${-p.size/2}" y1="0" x2="${p.size/2}" y2="0" stroke="${color}" stroke-width="${Math.max(0.5, p.size*0.12)}" transform="${transform}" />`;
          return `<path d="M ${-p.size/2} ${-p.size/2} A ${p.size} ${p.size} 0 0 1 ${p.size/2} ${p.size/2} L ${-p.size/2} ${-p.size/2} Z" fill="${color}" transform="${transform}" />`;
        }).join('');
      };

      const createSvgText = (s: SlotSettings, w: number, h: number, q: number) => {
        if (!store.showTypography || !s.text) return '';
        const tx = w * (s.textX / 100);
        const ty = h * (s.textY / 100);
        return `<text x="${tx}" y="${ty}" font-family="${s.fontFamily.replace(/'/g, '')}" font-size="${s.textSize * q}" font-weight="bold" fill="${s.textColor}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${s.textRotation}, ${tx}, ${ty})">${s.text}</text>`;
      };

      let svg = `<svg width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}" xmlns="http://www.w3.org/2000/svg">`;
      if (isMaster) {
         collageLayout.forEach(item => {
            const s = store.slots[item.slotIdx];
            const localW = item.w * qualityScale;
            const localH = item.h * qualityScale;
            const pts = generatePoints(s.mode, localW, localH, { ...s, tileShape: store.tileShape });
            svg += `<g transform="translate(${item.x * qualityScale}, ${item.y * qualityScale})">`;
            svg += `<rect width="${localW}" height="${localH}" fill="${s.bgColor}" />`;
            svg += createSvgPoints(pts, s.fgColor, qualityScale);
            svg += createSvgText(s, localW, localH, qualityScale);
            svg += `</g>`;
         });
      } else {
        const s = store.slots[slotIdx as number];
        const pts = generatePoints(s.mode, exportW, exportH, { ...s, tileShape: store.tileShape });
        if (!isTransparent) svg += `<rect width="100%" height="100%" fill="${s.bgColor}" />`;
        svg += createSvgPoints(pts, s.fgColor, qualityScale);
        svg += createSvgText(s, exportW, exportH, qualityScale);
      }
      svg += `</svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `swiss-export-${slotIdx}-${Date.now()}.svg`;
      link.click();
    } else {
      const link = document.createElement('a');
      link.download = `swiss-export-${slotIdx}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  useEffect(() => {
    const handleExport = (e: any) => processExport(e.detail.slotIndex, e.detail.format);
    window.addEventListener('export-collage-slot', handleExport);
    return () => window.removeEventListener('export-collage-slot', handleExport);
  }, [store, collageLayout]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#050505] p-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(#888 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="relative shadow-2xl bg-black overflow-hidden ring-4 ring-zinc-800">
        <canvas 
          ref={canvasRef}
          width={store.canvasWidth}
          height={store.canvasHeight}
          className="max-w-full max-h-full object-contain cursor-crosshair"
          style={{ width: 'min(80vh, 85vw)', height: 'min(80vh, 85vw)' }}
        />
        <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2 text-[8px] text-zinc-700 mono uppercase tracking-widest">
          <span>AI_STUDIO_V4:TYPE_EXPERT</span>
          <span>COMPOSITION_SYNC:READY</span>
        </div>
      </div>
    </div>
  );
};
