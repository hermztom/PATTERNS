
export class Random {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple LCG random number generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat(min, max));
  }
}

// Simple 2D Perlin-like noise
export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

export function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
