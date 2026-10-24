"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { isFacebookInAppBrowser } from "@/lib/isInAppBrowser";
import GoogleSVG from "./GoogleSVG";
import LoadingSVG from "./LoadingSVG";
import Logo from "@/components/Logo";
import { AlertCircle } from "lucide-react";

export default function LoginForm() {
    const { user, loginWithGoogle } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInAppBrowser] = useState(isFacebookInAppBrowser());
    const [copied, setCopied] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const shouldRedirect = searchParams.get("redirect") === "true";

    useEffect(() => {
        if (user && shouldRedirect) {
            router.replace("/dashboard");
        }
    }, [user, shouldRedirect, router]);

    const handleGoogleSignIn = async () => {
        setError(null);

        await performGoogleSignIn();
    };

    const performGoogleSignIn = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            await loginWithGoogle();

            router.replace("/dashboard");
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to sign in with Google."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setError(
                "লিংক কপি করা যায়নি। Address bar থেকে লিংকটি কপি করুন।"
            );
        }
    };

    if (user && shouldRedirect) {
        return null;
    }

    if (user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <p className="font-medium text-gray-700">
                        You are already logged in as{" "}
                        <span className="font-semibold text-gray-900">
                            {user.email}
                        </span>
                        .
                    </p>

                    <button
                        onClick={() => router.replace("/dashboard")}
                        className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center  p-4">
            <div className="w-full max-w-md rounded-2xl border p-8">

                <div className="text-center">
                    <div className="flex flex-col justify-center items-center gap-1">
                        <Logo />
                        <h1 className="text-3xl text-gray-800 font-li-shohid">
                            প্রশ্নকোষ
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                        লগইন করুন
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-500">
                        {error}
                    </div>
                )}

                {/* In-app browser notice */}
                {isInAppBrowser && (
                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                <AlertCircle />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Facebook/Messenger থেকে ব্রাউজ করছেন
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                    Google দিয়ে লগইন করতে উপরের <span className="font-semibold">⋯ </span>
                                    মেনুতে ক্লিক করে <span className="font-semibold">Open in browser </span>
                                    অপশনে ট্যাপ করুন। অথবা এই পেজের লিংকটি কপি করে Chrome-এ খুলুন।
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={copyUrl}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
                        >
                            {copied ? (
                                <>
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Link copied
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            x="8"
                                            y="8"
                                            rx="2"
                                            ry="2"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
                                        />
                                    </svg>
                                    Copy link
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Google login button — ALWAYS visible */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-800  transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 border"
                    >
                        {isSubmitting ? (
                            <LoadingSVG />
                        ) : (
                            <GoogleSVG />
                        )}

                        <span>
                            {isSubmitting
                                ? "Signing in..."
                                : "Continue with Google"}
                        </span>
                    </button>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and
                    Privacy Policy.
                </p>
            </div>
        </div>
    );
}