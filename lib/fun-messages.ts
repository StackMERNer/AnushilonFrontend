export type FunEffect = "none" | "small" | "big" | "fireworks" | "rain";

export const STREAK_MILESTONES: {
  at: number;
  effect: FunEffect;
  messages: string[];
}[] = [
  {
    at: 3,
    effect: "none",
    messages: [
      "হ্যাট্রিক! টানা {n}টা সঠিক 🎯",
      "শুরুটা তো দারুণ! চালিয়ে যাও 😎",
      "তিন তিনটা! কপাল না, মেধা 🧠",
    ],
  },
  {
    at: 5,
    effect: "small",
    messages: [
      "ঐ কিরে ঐ কিরে! টানা {n}টা 🎉",
      "জোস! পাঁচে পাঁচ 🤩",
      "হেব্বি চলছে! থামার নাম নাই 🚀",
    ],
  },
  {
    at: 10,
    effect: "big",
    messages: [
      "মধু মধু! টানা {n}টা সঠিক 🍯",
      "ওস্তাদ! তুমি তো আগুন 🔥🔥",
      "দশে দশ! কেয়া বাত হ্যায় 👏",
      "এই তো চাই! টানা {n}টা 💪",
      "বুঝাই যাচ্ছে, আজ একটা ফাটাফাটি হবে! 🎉",
    ],
  },
  {
    at: 20,
    effect: "fireworks",
    messages: [
      "টানা {n}টা! ব্রেন একদম ফুল স্পিডে 🧠⚡",
      "পুরাই ফাটাফাটি! বিশে বিশ 🎆",
      "তোমার তুলনা তুমিই! টানা {n}টা 🏆",
    ],
  },
  {
    at: 50,
    effect: "rain",
    messages: [
      "টানা {n}টা!! তুমি কি মানুষ নাকি সুপার কম্পিউটার? 😳",
      "কিংবদন্তি! টানা {n}টা সঠিক 👑",
      "মহাজ্ঞানী উপাধি তোমার প্রাপ্য 🎓👑",
    ],
  },
];

// shown only when a streak of 5+ breaks, and always gentle
export const STREAK_BREAK = [
  "কোনো ব্যাপার না, আবার শুরু! 💪",
  "ভুল থেকেই শেখা হয়, চলো আবার 🌱",
  "ধারা ভাঙলেও মনটা ভাঙতে দিও না 😊",
];

export const GOAL_DONE = [
  "আজকের লক্ষ্য পূরণ! 🎯 দারুণ!",
  "মধু মধু! আজকের টার্গেট ক্লিয়ার 🍯",
  "টার্গেট ফতে! আজ তুমি বিজয়ী 🏅",
];

export const CHAPTER_DONE = [
  "“{name}” পুরো আয়ত্তে! ওস্তাদ তুমি 🏆",
  "{name} অধ্যায় ফতে! 🚩",
  "হেব্বি! {name} এখন তোমার হাতের মুঠোয় 🎓",
];

export function getMilestone(streak: number) {
  const exact = STREAK_MILESTONES.find((m) => m.at === streak);
  if (exact) return exact;
  // 100, 150, 200... repeat the top tier
  if (streak > 50 && streak % 50 === 0)
    return STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  return null;
}
