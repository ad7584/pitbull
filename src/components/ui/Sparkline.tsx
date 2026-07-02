import { useId } from "react";
import { cn } from "@/lib/cn";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClassName?: string;
  fill?: boolean;
}

/** Lightweight bespoke SVG sparkline with a soft area fill. */
export function Sparkline({ data, width = 160, height = 44, className, strokeClassName, fill = true }: Props) {
  const id = useId();
  if (data.length < 2) return <div style={{ width, height }} className={className} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const stepX = (width - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)},${height} L${pts[0][0].toFixed(2)},${height} Z`;

  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#B6FF3C" : "#F23674"} stopOpacity="0.28" />
          <stop offset="100%" stopColor={up ? "#B6FF3C" : "#F23674"} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${id})`} />}
      <path
        d={line}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(up ? "stroke-lime" : "stroke-danger", strokeClassName)}
      />
    </svg>
  );
}
