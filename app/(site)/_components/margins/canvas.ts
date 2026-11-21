export type CanvasSetup = {
  canvas: HTMLCanvasElement;
  colors: () => { bg: string; fg: string; subtle: string; accent: string };
  onTheme: (callback: () => void) => () => void;
};

export function readColor(value: string) {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.fillStyle = value;
  const hex = probe.fillStyle as string;
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export function createSetup(canvas: HTMLCanvasElement): CanvasSetup {
  const colors = () => {
    const style = getComputedStyle(canvas);
    const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
    return {
      bg: read("--canvas-bg", read("--bg", "#f3f2ee")),
      fg: read("--fg", "#141413"),
      subtle: read("--fg-subtle", "#6e6b64"),
      accent: read("--accent", "#e4572e"),
    };
  };

  const onTheme = (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  };

  return { canvas, colors, onTheme };
}
