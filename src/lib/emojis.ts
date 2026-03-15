const EMOJIS = [
  '🐶', '🐱', '🐻', '🐼', '🦊', '🐸', '🐵', '🦁',
  '🐧', '🐦', '🦉', '🐙', '🦋', '🐢', '🐬', '🦈',
  '🌻', '🌵', '🍄', '🔥', '⚡', '🌈', '⭐', '🎸',
  '🚀', '🎯', '🎲', '🧩', '🛸', '🌊',
];

export function pickEmoji(existingEmojis: string[]): string {
  const available = EMOJIS.filter((e) => !existingEmojis.includes(e));
  const pool = available.length > 0 ? available : EMOJIS;
  return pool[Math.floor(Math.random() * pool.length)];
}
