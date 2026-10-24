// _components/data-table.tsx
"use client";
import { ReactNode, useMemo, useState } from "react";
import { INPUT } from "./shared";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** value used for sorting; omit to make the column unsortable */
  sort?: (row: T) => number | string | null;
  align?: "left" | "right";
}

export function DataTable<T>({
  rows,
  columns,
  searchText,
  onRowClick,
  pageSize = 15,
  defaultSort,
  empty = "No data for the current filters.",
}: {
  rows: T[];
  columns: Column<T>[];
  searchText?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  empty?: string;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(defaultSort);

  const view = useMemo(() => {
    let r = rows;
    const s = q.trim().toLowerCase();
    if (s && searchText) r = r.filter((x) => searchText(x).toLowerCase().includes(s));
    const col = columns.find((c) => c.key === sort?.key);
    if (col?.sort) {
      const dir = sort!.dir === "asc" ? 1 : -1;
      r = [...r].sort((a, b) => {
        const av = col.sort!(a);
        const bv = col.sort!(b);
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
      });
    }
    return r;
  }, [rows, q, sort, columns, searchText]);

  const totalPages = Math.max(1, Math.ceil(view.length / pageSize));
  const cur = Math.min(page, totalPages);
  const slice = view.slice((cur - 1) * pageSize, cur * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <div>
      {searchText && (
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search…"
          className={`${INPUT} mb-2 w-full max-w-xs`}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 dark:border-neutral-800">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-2 py-2 font-medium ${c.align === "right" ? "text-right" : "text-left"} ${c.sort ? "cursor-pointer select-none" : ""}`}
                  onClick={() => c.sort && toggleSort(c.key)}
                >
                  {c.header}
                  {sort?.key === c.key && (sort.dir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-neutral-100 dark:border-neutral-800/60 ${onRowClick ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-neutral-800/60" : ""}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-2 py-2 align-top ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {!slice.length && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-8 text-center text-neutral-400">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {view.length > pageSize && (
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
          <span>{view.length.toLocaleString()} rows</span>
          <div className="flex items-center gap-2">
            <button className={`${INPUT} h-8 disabled:opacity-40`} disabled={cur <= 1} onClick={() => setPage(cur - 1)}>
              Prev
            </button>
            <span>
              {cur} / {totalPages}
            </span>
            <button className={`${INPUT} h-8 disabled:opacity-40`} disabled={cur >= totalPages} onClick={() => setPage(cur + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
