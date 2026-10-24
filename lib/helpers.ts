import { ISubjectSubscription, IUser } from "@/types/user";

export function toBnDigits(n: number): string {
  const map: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}

export const getFormattedTime = (timeMinute: number, version: "bn" | "en") => {
  const hours = Math.floor(timeMinute / 60);
  const minutes = timeMinute % 60;

  if (version === "bn") {
    const parts = [];

    if (hours > 0) {
      parts.push(`${toBnDigits(hours)} ঘণ্টা`);
    }

    if (minutes > 0) {
      parts.push(`${toBnDigits(minutes)} মিনিট`);
    }

    return parts.join(" ");
  }

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  return parts.join(" ");
};

export const formatDateToDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  } else if (parts.length === 2) {
    const [year, month] = parts;
    return `${month}/${year}`;
  }
  return dateStr;
};

export function hasActiveSubscription(user: IUser): boolean {
  const { subscription } = user;

  if (!subscription) {
    return false;
  }

  return new Date(subscription.expiresAt) > new Date();
}

export const hasActiveSubjectSubscription = (
  subjectSubscription: ISubjectSubscription,
) => {
  return new Date(subjectSubscription.expiresAt) > new Date();
};

export const getRemainingDays = (expiresAt: string | Date) => {
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();

  return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
};

export const formatBengaliDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
};
