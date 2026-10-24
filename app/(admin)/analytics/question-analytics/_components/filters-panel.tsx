// _components/filters-panel.tsx
"use client";
import type {
  QuestionAnalyticsDataQualityIssue,
  QuestionAnalyticsFilterOptions,
  QuestionAnalyticsFilters,
} from "@/types/analytics/question-analytics";
import { useMemo, useState } from "react";
import { MultiSelect, Option } from "./multi-select";
import { CARD, INPUT, ISSUE_OPTIONS } from "./shared";

type Props = {
  filters: QuestionAnalyticsFilters;
  onChange: (f: QuestionAnalyticsFilters) => void;
  options?: QuestionAnalyticsFilterOptions;
  loading?: boolean;
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Tri({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-500">
      {label}
      <select
        className={INPUT}
        value={value === undefined ? "" : value ? "yes" : "no"}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value === "yes")}
      >
        <option value="">Any</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-500">
      {label}
      <input
        type="number"
        className={INPUT}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </label>
  );
}

function DateRange({
  label,
  value,
  onChange,
  quick,
}: {
  label: string;
  value?: { from?: string; to?: string };
  onChange: (v: { from?: string; to?: string } | undefined) => void;
  quick?: boolean;
}) {
  const set = (k: "from" | "to", v: string) => {
    const next = { ...value, [k]: v || undefined };
    onChange(next.from || next.to ? next : undefined);
  };
  const lastDays = (n: number) => {
    const date = new Date();
    date.setDate(date.getDate() - n);

    onChange({
      from: ymd(date),
      to: undefined,
    });
  };
  return (
    <div className="flex flex-col gap-1 text-xs text-neutral-500">
      <span>{label}</span>
      <div className="flex gap-1.5">
        <input type="date" className={`${INPUT} min-w-0 flex-1`} value={value?.from ?? ""} onChange={(e) => set("from", e.target.value)} />
        <input type="date" className={`${INPUT} min-w-0 flex-1`} value={value?.to ?? ""} onChange={(e) => set("to", e.target.value)} />
      </div>
      {quick && (
        <div className="flex gap-1">
          {[7, 30, 90, 365].map((n) => (
            <button key={n} type="button" onClick={() => lastDays(n)} className="rounded bg-neutral-100 px-1.5 py-0.5 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
              {n === 365 ? "1y" : `${n}d`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FiltersPanel({ filters, onChange, options, loading }: Props) {
  const [advanced, setAdvanced] = useState(false);

  const set = <K extends keyof QuestionAnalyticsFilters>(k: K, v: QuestionAnalyticsFilters[K]) => {
    const next = { ...filters };
    const empty = v === undefined || v === null || (Array.isArray(v) && v.length === 0);
    if (empty) delete next[k];
    else next[k] = v;
    onChange(next);
  };

  const o = (list?: { id: string; name: string; count?: number }[]): Option[] => list ?? [];
  const yearOptions = useMemo<Option[]>(
    () =>
      (options?.examYears ?? []).map((y) => ({
        id: String(y.year),
        name: String(y.year),
        count: y.questionCount,
      })),
    [options?.examYears],
  );

  const active = Object.keys(filters).length;

  return (
    <div className={`${CARD} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          Filters
          {active > 0 && (
            <span className="rounded-full bg-blue-600 px-2 text-xs font-normal text-white">{active}</span>
          )}
          {loading && <span className="text-xs font-normal text-neutral-400">updating…</span>}
        </div>
        <div className="flex gap-2">
          <button className="text-xs text-blue-600" onClick={() => setAdvanced((a) => !a)}>
            {advanced ? "Hide advanced" : "Advanced"}
          </button>
          {active > 0 && (
            <button className="text-xs text-red-600" onClick={() => onChange({})}>
              Reset all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        <MultiSelect label="Class" options={o(options?.classes)} value={filters.classIds ?? []} onChange={(v) => set("classIds", v)} />
        <MultiSelect label="Subject" options={o(options?.subjects)} value={filters.subjectIds ?? []} onChange={(v) => set("subjectIds", v)} />
        <MultiSelect label="Chapter" options={o(options?.chapters)} value={filters.chapterIds ?? []} onChange={(v) => set("chapterIds", v)} />
        <MultiSelect label="Topic" options={o(options?.topics)} value={filters.topicIds ?? []} onChange={(v) => set("topicIds", v)} />
        <MultiSelect label="Question type" options={o(options?.types)} value={filters.types ?? []} onChange={(v) => set("types", v)} />
        <MultiSelect
          label="Exam year"
          options={yearOptions}
          value={(filters.examYears ?? []).map(String)}
          onChange={(v) => set("examYears", v.map(Number))}
        />
        <MultiSelect label="Board" options={o(options?.boards)} value={filters.boardIds ?? []} onChange={(v) => set("boardIds", v)} />
        <MultiSelect label="School" options={o(options?.schools)} value={filters.schoolIds ?? []} onChange={(v) => set("schoolIds", v)} />
        <MultiSelect label="University" options={o(options?.universities)} value={filters.universityIds ?? []} onChange={(v) => set("universityIds", v)} />
        <MultiSelect label="Difficulty" options={o(options?.difficulties)} value={filters.difficulties ?? []} onChange={(v) => set("difficulties", v)} />
        <MultiSelect label="Level" options={o(options?.levels)} value={filters.levels ?? []} onChange={(v) => set("levels", v)} />
        <MultiSelect label="Tags" options={o(options?.tags)} value={filters.tags ?? []} onChange={(v) => set("tags", v)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <DateRange label="Added between" value={filters.createdAt} onChange={(v) => set("createdAt", v)} quick />
        <DateRange label="Updated between" value={filters.updatedAt} onChange={(v) => set("updatedAt", v)} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Exam year from" value={filters.minExamYear} onChange={(v) => set("minExamYear", v)} placeholder="e.g. 2018" />
          <NumberField label="Exam year to" value={filters.maxExamYear} onChange={(v) => set("maxExamYear", v)} placeholder="e.g. 2025" />
        </div>
      </div>

      {advanced && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-3 md:grid-cols-4 xl:grid-cols-8 dark:border-neutral-800">
          <NumberField label="Min rating" value={filters.minRating} onChange={(v) => set("minRating", v)} />
          <NumberField label="Max rating" value={filters.maxRating} onChange={(v) => set("maxRating", v)} />
          <Tri label="Has answer" value={filters.hasAnswer} onChange={(v) => set("hasAnswer", v)} />
          <Tri label="Has context" value={filters.hasContext} onChange={(v) => set("hasContext", v)} />
          <Tri label="Has options" value={filters.hasOptions} onChange={(v) => set("hasOptions", v)} />
          <Tri label="Has topic" value={filters.hasTopic} onChange={(v) => set("hasTopic", v)} />
          <Tri label="Has board" value={filters.hasBoards} onChange={(v) => set("hasBoards", v)} />
          <Tri label="Has school" value={filters.hasSchools} onChange={(v) => set("hasSchools", v)} />
          <Tri label="Has university" value={filters.hasUniversities} onChange={(v) => set("hasUniversities", v)} />
          <div className="col-span-2 flex flex-col gap-1 text-xs text-neutral-500">
            Has data issue
            <MultiSelect
              label="Issues"
              options={ISSUE_OPTIONS}
              value={filters.dataQuality ?? []}
              onChange={(v) => set("dataQuality", v as QuestionAnalyticsDataQualityIssue[])}
            />
          </div>
        </div>
      )}
    </div>
  );
}
