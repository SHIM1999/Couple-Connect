const STORAGE_KEY = "coupleCode";

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function getCoupleCode(): string {
  // If URL has ?c=<code>, adopt it (partner opened the invite link)
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get("c");
  if (urlCode && urlCode.length >= 4) {
    localStorage.setItem(STORAGE_KEY, urlCode.toLowerCase());
    // Remove ?c= from URL without page reload
    const clean = new URL(window.location.href);
    clean.searchParams.delete("c");
    window.history.replaceState({}, "", clean.toString());
    return urlCode.toLowerCase();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const code = generateCode();
  localStorage.setItem(STORAGE_KEY, code);
  return code;
}

export function getInviteUrl(): string {
  return `${window.location.origin}?c=${getCoupleCode()}`;
}
