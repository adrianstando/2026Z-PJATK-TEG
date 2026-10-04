/**
 * Rozmieszczenie podpisów punktów bez nakładania (zachłannie): dla każdego punktu próbuje
 * pozycji nad, pod, z prawej, z lewej i ukośnie i wybiera pierwszą, która nie koliduje z już
 * postawionymi podpisami ani punktami. Szerokość tekstu szacowana z liczby znaków.
 */
export type LabelPos = { dx: number; dy: number; anchor: "middle" | "start" | "end" };

type Box = { x0: number; y0: number; x1: number; y1: number };
const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

export function layoutLabels(
  points: { x: number; y: number; text: string }[],
  opts: { font: number; r: number; width: number; height: number; avoid?: Box[] },
): LabelPos[] {
  const { font, r, width, height } = opts;
  const placed: Box[] = [...(opts.avoid ?? []), ...points.map((p) => ({ x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r }))];
  return points.map((p) => {
    const w = p.text.length * font * 0.6;
    const gap = r + 4;
    const candidates: (LabelPos & { box: Box })[] = [
      { dx: 0, dy: -gap, anchor: "middle", box: { x0: p.x - w / 2, y0: p.y - gap - font, x1: p.x + w / 2, y1: p.y - gap } },
      { dx: 0, dy: gap + font * 0.8, anchor: "middle", box: { x0: p.x - w / 2, y0: p.y + gap, x1: p.x + w / 2, y1: p.y + gap + font } },
      { dx: gap, dy: font * 0.35, anchor: "start", box: { x0: p.x + gap, y0: p.y - font / 2, x1: p.x + gap + w, y1: p.y + font / 2 } },
      { dx: -gap, dy: font * 0.35, anchor: "end", box: { x0: p.x - gap - w, y0: p.y - font / 2, x1: p.x - gap, y1: p.y + font / 2 } },
    ];
    // ukośne: nad/pod punktem, przesunięte w bok
    for (const [sx, sy] of [[1, -1], [-1, -1], [1, 1], [-1, 1]] as const) {
      const y0 = sy < 0 ? p.y - gap - font : p.y + gap;
      const x0 = sx > 0 ? p.x + r : p.x - r - w;
      candidates.push({ dx: sx * r, dy: sy < 0 ? -gap : gap + font * 0.8, anchor: sx > 0 ? "start" : "end", box: { x0, y0, x1: x0 + w, y1: y0 + font } });
    }
    const inside = (b: Box) => b.x0 >= 0 && b.x1 <= width && b.y0 >= 0 && b.y1 <= height;
    // bez wolnego miejsca: pozycja z najmniejszą łączną powierzchnią nakładania
    const overlap = (c: Box) =>
      placed.reduce((sum, b) => sum + Math.max(0, Math.min(c.x1, b.x1) - Math.max(c.x0, b.x0)) * Math.max(0, Math.min(c.y1, b.y1) - Math.max(c.y0, b.y0)), 0);
    const fits = candidates.filter((c) => inside(c.box));
    const best =
      fits.find((c) => !placed.some((b) => hit(b, c.box))) ??
      [...(fits.length ? fits : candidates)].sort((x, y) => overlap(x.box) - overlap(y.box))[0];
    placed.push(best.box);
    return { dx: best.dx, dy: best.dy, anchor: best.anchor };
  });
}
