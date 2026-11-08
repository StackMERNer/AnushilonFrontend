import Link from "next/link";
import { createStudyService } from "@/services/study.service";
import { startNewCardsAction } from "@/app/actions/study";
import { createServerApiClient } from "@/lib/api/api-server";
import { toBnDigits } from "@/lib/helpers";

export default async function ChapterProgressList({ subjectId }: { subjectId: string }) {
    const rows = await createStudyService(createServerApiClient()).getSubjectProgress(subjectId);
    return (
        <ul className="space-y-3 px-5">
            {rows.map((r) => {
                const studiedPct = r.total ? (r.studied / r.total) * 100 : 0;
                const masteredPct = r.total ? (r.mastered / r.total) * 100 : 0;
                return (
                    <li key={r.chapterId} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium">{r.name}</h3>
                            <span className="text-sm text-gray-500">{toBnDigits(Math.round(studiedPct))}%</span>
                        </div>

                        <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className="absolute h-full bg-blue-300" style={{ width: `${studiedPct}%` }} />
                            <div className="absolute h-full bg-green-500" style={{ width: `${masteredPct}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            মোট {toBnDigits(r.total)} · শুরু করেছ {toBnDigits(r.studied)} · আয়ত্তে {toBnDigits(r.mastered)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {r.due > 0 && (
                                <Link
                                    href={`/review?chapter=${r.chapterId}`}
                                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white"
                                >
                                    রিভিউ ({toBnDigits(r.due)})
                                </Link>
                            )}
                            <form action={startNewCardsAction} className="flex items-center gap-2">
                                <input type="hidden" name="chapterId" value={r.chapterId} />
                                <select name="count" defaultValue="10" className="rounded-lg border px-2 py-1.5 text-sm">
                                    {[5, 10, 20, 50].map((n) => (
                                        <option key={n} value={n}>
                                            {toBnDigits(n)}টি
                                        </option>
                                    ))}
                                </select>
                                <button
                                    disabled={r.studied >= r.total}
                                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                                >
                                    নতুন প্রশ্ন শুরু করো
                                </button>
                            </form>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}