import { plansInfo } from "@/lib/constants";
import Link from "next/link";


const PlansContent = () => {

    return (
        < >
            <div className="container">
                <div className="grid gap-y-10  md:grid-cols-2 md:gap-x-3 lg:gap-x-3">
                    {/* Paid Plans */}
                    {plansInfo.map((plan) => (
                        <div
                            key={plan.type}
                            className="relative p-8 border rounded-2xl shadow-sm flex flex-col dark:bg-neutral-900"
                        >
                            {plan.popular && (
                                <p className="absolute top-0 right-8 py-1.5 px-4 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                                    পপুলার
                                </p>
                            )}

                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">
                                    {plan.name}
                                </h3>
                                <p className="mt-4 flex items-baseline text-nowrap">
                                    {(plan.originalPrice) && (
                                        <span className="text-2xl font-medium text-muted-foreground line-through mr-3">
                                            {toBnDigits(plan.originalPrice)}৳
                                        </span>
                                    )}
                                    <span className="text-4xl font-extrabold tracking-tight">
                                        {toBnDigits(plan.price)}৳
                                    </span>

                                    <span className="ml-1 text-xl font-semibold">
                                        {plan.durationLabel}
                                    </span>
                                </p>

                                <PlanFeatures features={plan.features} />
                            </div>

                            {plan.isFree ? <Link
                                href={`/dashboard`}
                                className="bg-secondary font-bold block w-full py-3 px-6 rounded-md text-center  mt-6"
                            >

                                ফ্রি চালিয়ে যান

                            </Link> : <Link
                                href={`/payment-methods?plan=${plan.type}`}
                                className="bg-primary text-white  block w-full py-3 px-6 rounded-md text-center font-medium mt-6"
                            >

                                সিলেক্ট করুন
                            </Link>}
                        </div>
                    ))}
                    <div
                        key={'subject_wise'}
                        className="relative p-8 border rounded-2xl shadow-sm flex flex-col dark:bg-neutral-900"
                    >

                        {/* <p className="absolute top-0 right-8 py-1.5 px-4 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                            টিউটর
                        </p> */}


                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">
                                বিষয় ভিত্তিক
                            </h3>
                            <p className="mt-4 flex items-baseline text-nowrap">
                                {/* {(plan.originalPrice) && (
                                        <span className="text-2xl font-medium text-muted-foreground line-through mr-3">
                                            {toBnDigits(plan.originalPrice)}৳
                                        </span>
                                    )} */}
                                <span className="text-4xl font-extrabold tracking-tight">
                                    {toBnDigits(100)}৳
                                </span>

                                <span className="ml-1 text-xl font-semibold">
                                    / বিষয়
                                </span>
                            </p>

                            <PlanFeatures features={['বিষয় ভিত্তিক অ্যাকসেস', "১ বছর"]} />
                        </div>

                        <Link
                            href={`/plans/select-subjects`}
                            className="bg-primary text-white  block w-full py-3 px-6 rounded-md text-center font-medium mt-6"
                        >

                            বিষয় নির্বাচন করুন
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

interface PlanFeaturesProps {
    features: string[];
}

const PlanFeatures = ({ features }: PlanFeaturesProps) => {
    return (
        <ul role="list" className="mt-6 space-y-6">
            {features.map((feature) => (
                <li key={feature} className="flex">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 w-6 h-6 text-emerald-500"
                        aria-hidden="true"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>

                    <span className="ml-3">{feature}</span>
                </li>
            ))}
        </ul>
    );
};

const toBnDigits = (value: number) => {
    return value.toString().replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[+digit]);
};

export default PlansContent;