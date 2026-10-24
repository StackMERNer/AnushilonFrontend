// "use client";
// import { useEffect } from "react";
// import { useEditingToolbarStore } from "@/store/editing-toolbar-store";

// export default function EditingSelectionWatcher() {
//     const { show, hide } = useEditingToolbarStore();

//     useEffect(() => {
//         function reposition() {
//             const sel = window.getSelection();
//             if (!sel || sel.rangeCount === 0) return;
//             const el = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
//             if (!el?.closest('[contenteditable="true"]')) return;
//             const rect = sel.getRangeAt(0).getBoundingClientRect();
//             if (rect.width === 0 && rect.height === 0 && rect.top === 0) return; // detached/invalid
//             show(rect);
//         }
//         window.addEventListener("scroll", reposition, true); // capture=true catches nested scroll containers
//         window.addEventListener("resize", reposition);
//         return () => {
//             window.removeEventListener("scroll", reposition, true);
//             window.removeEventListener("resize", reposition);
//         };
//     }, [show, hide]);

//     return null;
// }