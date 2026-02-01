export function cn(...cls) {
  return cls.filter(Boolean).join(" ");
}

export function slug(s) {
  return (s || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 3) || "X";
}

export function buildPlayerSlots(categories) {
  const slots = [];
  for (const c of categories) {
    const key = slug(c.key);
    const count = Math.max(0, Number(c.count || 0));
    for (let i = 1; i <= count; i++) {
      slots.push({ category: key, rank: `${key}${i}`, name: "" });
    }
  }
  return slots;
}

export function buildMatchTypeOptions(categories) {
  const keys = categories.map((c) => slug(c.key)).filter(Boolean);
  const unique = Array.from(new Set(keys)).sort();
  const opts = [];
  for (let i = 0; i < unique.length; i++) {
    for (let j = i; j < unique.length; j++) {
      const a = unique[i];
      const b = unique[j];
      opts.push({ key: `${a}__${b}`, label: `${a}${b}`, a, b });
    }
  }
  return opts;
}

export function buildMatchRows(matchTypeOptions, matchTypeConfig) {
  const rows = [];
  let id = 1;
  for (const opt of matchTypeOptions) {
    const count = Math.max(0, Number(matchTypeConfig?.[opt.key] || 0));
    for (let i = 0; i < count; i++) {
      rows.push({ id, typeKey: opt.key, label: opt.label, categories: [opt.a, opt.b] });
      id += 1;
    }
  }
  return rows;
}
