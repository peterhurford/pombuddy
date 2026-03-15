const EMOJIS = [
  '🐶', '🐱', '🐻', '🐼', '🦊', '🐸', '🐵', '🦁',
  '🐧', '🐦', '🦉', '🐙', '🦋', '🐢', '🐬', '🦈',
  '🌻', '🌵', '🍄', '🔥', '⚡', '🌈', '⭐', '🎸',
  '🚀', '🎯', '🎲', '🧩', '🛸', '🌊', '🐲', '🦄',
  '🐝', '🦀', '🐳', '🦩', '🦜', '🐺', '🐨', '🐯',
  '🦅', '🐞', '🍀', '🌙', '🪐', '💎', '🏔️', '🎪',
  '🎭', '🎨', '🧲', '🔮', '🪁', '🎠', '🌋', '🏝️',
  '🦚', '🦥', '🐡', '🦑',
];

export function pickEmoji(existingEmojis: string[]): string {
  const available = EMOJIS.filter((e) => !existingEmojis.includes(e));
  const pool = available.length > 0 ? available : EMOJIS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomEmojis(count: number): string[] {
  const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
