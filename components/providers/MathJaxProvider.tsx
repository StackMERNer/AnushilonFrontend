// components/MathJaxProvider.tsx
"use client";

import Script from "next/script";

export default function MathJaxProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Inline Config Script */}
            <Script id="mathjax-config" strategy="beforeInteractive">
                {`
                    window.MathJax = {
                        tex2jax: {
                            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                            processEscapes: false,
                            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
                        },
                        "HTML-CSS": { fonts: ["TeX"] },
                        CommonHTML: { mtextFontInherit: true }
                    };
                `}
            </Script>

            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"
                strategy="lazyOnload"
            />

            {children}
        </>
    );
}