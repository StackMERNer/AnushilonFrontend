// _components/multi-select.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { INPUT, fmt } from "./shared";

export interface Option {
  id: string;
  name: string;
  count?: number;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? options.filter((o) => o.name.toLowerCase().includes(s)) : options;
  }, [options, q]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${INPUT} flex w-full items-center justify-between gap-2 text-left`}
      >
        <span className="truncate">
          {label}
          {value.length > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 text-xs text-white">
              {value.length}
            </span>
          )}
        </span>
        <span className="text-neutral-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-72 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className={`${INPUT} mb-2 w-full`}
          />
          <div className="mb-1 flex justify-between px-1 text-xs text-neutral-500">
            <span>{fmt(filtered.length)} options</span>
            {value.length > 0 && (
              <button className="text-blue-600" onClick={() => onChange([])}>
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-auto">
            {filtered.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <input
                    type="checkbox"
                    checked={value.includes(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="flex-1 truncate" title={o.name}>
                    {o.name}
                  </span>
                  {o.count != null && (
                    <span className="text-xs tabular-nums text-neutral-400">{fmt(o.count)}</span>
                  )}
                </label>
              </li>
            ))}
            {!filtered.length && (
              <li className="px-2 py-3 text-center text-xs text-neutral-400">No options</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
