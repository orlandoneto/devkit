export type PasswordOptions = {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
};

const SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

function randomFrom(charset: string) {
  const index = Math.floor(Math.random() * charset.length);
  return charset[index];
}

export function generatePassword(options: PasswordOptions = {}) {
  const length = Math.min(Math.max(options.length ?? 16, 4), 128);
  const uppercase = options.uppercase ?? true;
  const lowercase = options.lowercase ?? true;
  const numbers = options.numbers ?? true;
  const symbols = options.symbols ?? true;

  let charset = "";
  const required: string[] = [];

  if (uppercase) {
    charset += SETS.uppercase;
    required.push(randomFrom(SETS.uppercase));
  }
  if (lowercase) {
    charset += SETS.lowercase;
    required.push(randomFrom(SETS.lowercase));
  }
  if (numbers) {
    charset += SETS.numbers;
    required.push(randomFrom(SETS.numbers));
  }
  if (symbols) {
    charset += SETS.symbols;
    required.push(randomFrom(SETS.symbols));
  }

  if (!charset) {
    charset = SETS.lowercase;
    required.push(randomFrom(SETS.lowercase));
  }

  const chars = [...required];
  while (chars.length < length) {
    chars.push(randomFrom(charset));
  }

  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
