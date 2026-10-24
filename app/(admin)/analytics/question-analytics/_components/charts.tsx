"use client";
import type {
  QuestionAnalyticsDistributionItem,
  QuestionAnalyticsGranularity,
  QuestionAnalyticsTimePoint,
  QuestionAnalyticsYearBreakdown,
} from "@/types/analytics/question-analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PALETTE, fmt, fmtBucket } from "./shared";

export function TimeSeriesChart({
  points,
  granularity,
}: {
  points: QuestionAnalyticsTimePoint[];
  granularity: QuestionAnalyticsGranularity;
}) {
  if (!points.length) return <Empty />;
  const data = points.map((p) => ({ label: fmtBucket(p.date, granularity), count: p.count, date: p.date }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
        <Tooltip formatter={(v) => [fmt(Number(v)), "Questions"]} labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ""} />
        <Bar dataKey="count" fill={PALETTE[0]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function YearChart({ data }: { data: QuestionAnalyticsYearBreakdown[] }) {
  if (!data.length) return <Empty />;
  const sorted = [...data].sort((a, b) => a.year - b.year);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
        <Tooltip />
        <Legend />
        <Bar dataKey="boardQuestionCount" name="Board" stackId="a" fill={PALETTE[0]} />
        <Bar dataKey="schoolQuestionCount" name="School" stackId="a" fill={PALETTE[1]} />
        <Bar dataKey="universityQuestionCount" name="University" stackId="a" fill={PALETTE[2]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TypeDonut({ items }: { items: QuestionAnalyticsDistributionItem[] }) {
  if (!items.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={items} dataKey="count" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {items.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v, n) => [fmt(Number(v)), String(n).toUpperCase()]} />
        {/* <Legend formatter={(v) => String(v).toUpperCase()} /> */}
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Clickable horizontal bars; clicking drills down by setting a filter. */
export function DistributionBars({
  items,
  onSelect,
  max = 12,
}: {
  items: QuestionAnalyticsDistributionItem[];
  onSelect?: (item: QuestionAnalyticsDistributionItem) => void;
  max?: number;
}) {
  if (!items.length) return <Empty />;
  const top = items.slice(0, max);
  const peak = Math.max(...top.map((i) => i.count), 1);
  return (
    <ul className="space-y-1.5">
      {top.map((i) => (
        <li key={`${i.id}-${i.label}`}>
          <button
            type="button"
            disabled={!onSelect || !i.id}
            onClick={() => onSelect?.(i)}
            className="group w-full text-left disabled:cursor-default"
          >
            <div className="flex justify-between text-xs">
              <span className="truncate pr-2">{i.label}</span>
              <span className="tabular-nums text-neutral-500">
                {fmt(i.count)} · {i.percentage}%
              </span>
            </div>
            <div className="h-2 rounded bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded bg-blue-600 group-hover:bg-blue-500"
                style={{ width: `${(i.count / peak) * 100}%` }}
              />
            </div>
          </button>
        </li>
      ))}
      {items.length > max && (
        <li className="text-xs text-neutral-400">+ {items.length - max} more (see tables)</li>
      )}
    </ul>
  );
}

function Empty() {
  return <div className="py-10 text-center text-sm text-neutral-400">No data for the current filters.</div>;
}
