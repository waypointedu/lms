export function startOfWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
}
