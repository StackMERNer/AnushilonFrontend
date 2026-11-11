"use client";

import { RefObject, useEffect } from "react";

/**
 * MathJax v2: typesets `ref` now, and again whenever new content is added
 * inside it (next question, revealed answer, async-rendered HTML...).
 */
export function useMathTypeset(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let busy = false;
    let attempts = 0;

    const observer = new MutationObserver(() => {
      if (busy) return; // ignore changes MathJax makes itself
      schedule();
    });

    const run = () => {
      const mj = (window as any).MathJax;
      if (!mj?.Hub) {
        // script still loading: retry for ~10s
        if (attempts++ < 40) timer = setTimeout(run, 250);
        return;
      }
      busy = true;
      mj.Hub.Queue(["Typeset", mj.Hub, el], () => {
        observer.takeRecords(); // drop mutations caused by the typesetting
        busy = false;
      });
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 40); // debounce bursts of changes
    };

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    run();

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref]);
}
