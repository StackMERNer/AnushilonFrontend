import Link from "next/link";
import { createStudyService } from "@/services/study.service";
import { createServerApiClient } from "@/lib/api/api-server";
import { toBnDigits } from "@/lib/helpers";


export default async function DueBanner() {
    const { totalDue } = await createStudyService(createServerApiClient()).getQueue({ limit: 1 });
    return (
        <Link
            href="/review"
            className="block rounded-2xl bg-green-600 p-5 text-white shadow-sm hover:bg-green-700"
        >
            <p className="text-sm opacity-90">আজকের রিভিউ</p>
            <p className="text-2xl font-semibold">
                {totalDue > 0 ? `${toBnDigits(totalDue)}টি প্রশ্ন বাকি` : "সব শেষ! 🎉"}
            </p>
        </Link>
    );
}