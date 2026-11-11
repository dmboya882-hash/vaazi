// Known colour names → swatch hex. Unknown names fall back to grey.
export const COLOR_HEX: Record<string, string> = {
  Black: "#1f1f1f",
  White: "#f5f5f0",
  Navy: "#1e2a44",
  Grey: "#8a8d91",
  Charcoal: "#3b3e42",
  Olive: "#5b6236",
  Khaki: "#b8a578",
  Sand: "#d6c7a8",
  Stone: "#c9c2b4",
  Brown: "#6b4a32",
  Tan: "#a8794f",
  Burgundy: "#6d2232",
  "Light Blue": "#a9c3dc",
  Indigo: "#2f3d68",
  Green: "#2f5d46",
  Cream: "#ece3cf",
  Rust: "#a4502c",
};

export function colorHex(name: string) {
  return COLOR_HEX[name] ?? "#9ca3af";
}
