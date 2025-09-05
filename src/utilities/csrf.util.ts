export function getCookie(name: string): string | null {
  const entry = document.cookie
    .split('; ')
    .find((r) => r.startsWith(name + '='));
  return entry ? decodeURIComponent(entry.split('=')[1]) : null;
}
