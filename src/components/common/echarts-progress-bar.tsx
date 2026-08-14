"use client";

import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

export type EChartsProgressSegment = {
  /** Absolute weight or percent share — segments are normalized to 100. */
  value: number;
  /** Solid fill, or gradient `[from, to]`. */
  color: string | readonly [string, string];
};

type EChartsProgressBarProps = {
  /** Single-fill percent (0–100). Ignored when `segments` is set. */
  value?: number;
  /** Stacked shares in one bar (e.g. Structural + Ad-hoc). */
  segments?: readonly EChartsProgressSegment[];
  /** Gradient stop colors `[from, to]` for single-fill mode. */
  color?: readonly [string, string];
  /** Chart container height (px). */
  height?: number;
  /** Bar thickness (px). Defaults to 8. */
  barWidth?: number;
  className?: string;
  /** Delay entrance fill (ms). */
  animationDelay?: number;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function resolveFillColor(color: string | readonly [string, string]) {
  if (typeof color === "string") return color;
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: color[0] },
      { offset: 1, color: color[1] },
    ],
  };
}

function normalizeSegments(
  segments: readonly EChartsProgressSegment[],
): { pct: number; color: EChartsProgressSegment["color"] }[] {
  const weights = segments.map((s) => Math.max(0, Number.isFinite(s.value) ? s.value : 0));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) {
    return segments.map((s) => ({ pct: 0, color: s.color }));
  }
  return segments.map((s, i) => ({
    pct: (weights[i]! / total) * 100,
    color: s.color,
  }));
}

export function EChartsProgressBar({
  value = 0,
  segments,
  color = ["#2563eb", "#38bdf8"],
  height = 28,
  barWidth = 8,
  className,
  animationDelay = 0,
}: EChartsProgressBarProps) {
  const chartRef = useRef<EChartsType | null>(null);
  const readyRef = useRef(false);
  const isStacked = Boolean(segments && segments.length > 0);
  const stacked = useMemo(
    () => (isStacked ? normalizeSegments(segments!) : []),
    [isStacked, segments],
  );
  const safeValue = clampPercent(value);
  const valuesRef = useRef<number[]>(isStacked ? stacked.map((s) => s.pct) : [safeValue]);
  valuesRef.current = isStacked ? stacked.map((s) => s.pct) : [safeValue];

  const safeBarWidth = Math.max(2, Math.min(height - 2, barWidth));
  const gridPad = Math.max(1, Math.floor((height - safeBarWidth) / 2));

  const baseOption = useMemo<EChartsOption>(() => {
    const shared = {
      type: "bar" as const,
      stack: isStacked ? "progress" : undefined,
      barWidth: safeBarWidth,
      animationDuration: 900,
      animationDurationUpdate: 900,
      animationEasing: "cubicOut" as const,
      animationEasingUpdate: "cubicOut" as const,
      animationDelay,
    };

    if (isStacked) {
      const last = stacked.length - 1;
      return {
        animation: true,
        animationDuration: 900,
        animationDurationUpdate: 900,
        animationEasing: "cubicOut",
        animationEasingUpdate: "cubicOut",
        grid: { top: gridPad, right: 0, bottom: gridPad, left: 0 },
        xAxis: { type: "value", min: 0, max: 100, show: false },
        yAxis: { type: "category", data: [""], show: false },
        series: stacked.map((seg, index) => ({
          ...shared,
          data: [0],
          showBackground: index === 0,
          backgroundStyle:
            index === 0
              ? {
                  color: "rgba(255,255,255,0.08)",
                  borderRadius: 999,
                }
              : undefined,
          itemStyle: {
            borderRadius:
              stacked.length === 1
                ? 999
                : index === 0
                  ? [999, 0, 0, 999]
                  : index === last
                    ? [0, 999, 999, 0]
                    : 0,
            color: resolveFillColor(seg.color),
          },
        })),
      };
    }

    return {
      animation: true,
      animationDuration: 900,
      animationDurationUpdate: 900,
      animationEasing: "cubicOut",
      animationEasingUpdate: "cubicOut",
      grid: { top: gridPad, right: 0, bottom: gridPad, left: 0 },
      xAxis: { type: "value", min: 0, max: 100, show: false },
      yAxis: { type: "category", data: [""], show: false },
      series: [
        {
          ...shared,
          data: [0],
          showBackground: true,
          backgroundStyle: {
            color: "rgba(255,255,255,0.08)",
            borderRadius: 999,
          },
          itemStyle: {
            borderRadius: 999,
            color: resolveFillColor(color),
          },
        },
      ],
    };
  }, [animationDelay, color, gridPad, isStacked, safeBarWidth, stacked]);

  const applyValues = (chart: EChartsType, next: number[]) => {
    if (chart.isDisposed?.()) return;
    chart.setOption(
      {
        series: next.map((v) => ({ data: [v] })),
      },
      { notMerge: false, lazyUpdate: false },
    );
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !readyRef.current) return;
    applyValues(chart, valuesRef.current);
  }, [safeValue, stacked]);

  useEffect(() => {
    return () => {
      chartRef.current = null;
      readyRef.current = false;
    };
  }, []);

  return (
    <ReactECharts
      option={baseOption}
      className={className}
      style={{ height, width: "100%", minWidth: 0 }}
      opts={{ renderer: "svg" }}
      notMerge={false}
      lazyUpdate={false}
      onChartReady={(chart) => {
        const instance = chart as EChartsType;
        chartRef.current = instance;
        readyRef.current = true;
        window.setTimeout(() => {
          if (!chartRef.current || chartRef.current.isDisposed?.()) return;
          applyValues(chartRef.current, valuesRef.current);
        }, animationDelay);
      }}
    />
  );
}
