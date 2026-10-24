export function isFacebookInAppBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";

  return /FBAN|FBAV|FBIOS|FB_IAB|FB4A|FB4B|Messenger/i.test(ua);
}
