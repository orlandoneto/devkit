export const LANGUAGE_EXAMPLES = [
  {
    id: "javascript",
    label: "JavaScript",
    code: `function calculateDigit(digits, weightStart) {
  const sum = digits.reduce((acc, d, i) => acc + d * (weightStart - i), 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

function generateCPF(regionDigit = Math.floor(Math.random() * 10)) {
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  base.push(regionDigit);
  const d1 = calculateDigit(base, 10);
  const d2 = calculateDigit([...base, d1], 11);
  return [...base, d1, d2].join("");
}

console.log(generateCPF()); // ex: 84712355208`,
  },
  {
    id: "python",
    label: "Python",
    code: `import random

def calc_digit(digits, weight_start):
    total = sum(d * (weight_start - i) for i, d in enumerate(digits))
    rem = total % 11
    return 0 if rem < 2 else 11 - rem

def generate_cpf(region_digit=None):
    region_digit = random.randint(0, 9) if region_digit is None else region_digit
    base = [random.randint(0, 9) for _ in range(8)] + [region_digit]
    d1 = calc_digit(base, 10)
    d2 = calc_digit(base + [d1], 11)
    return "".join(map(str, base + [d1, d2]))

print(generate_cpf())`,
  },
  {
    id: "java",
    label: "Java",
    code: `import java.util.Random;

public class CpfGenerator {
  static int calcDigit(int[] digits, int weightStart) {
    int sum = 0;
    for (int i = 0; i < digits.length; i++) sum += digits[i] * (weightStart - i);
    int rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  public static String generateCPF() {
    Random r = new Random();
    int[] base = new int[9];
    for (int i = 0; i < 8; i++) base[i] = r.nextInt(10);
    base[8] = r.nextInt(10);
    int d1 = calcDigit(base, 10);
    int[] withD1 = java.util.Arrays.copyOf(base, 10);
    withD1[9] = d1;
    int d2 = calcDigit(withD1, 11);
    StringBuilder sb = new StringBuilder();
    for (int d : base) sb.append(d);
    sb.append(d1).append(d2);
    return sb.toString();
  }
}`,
  },
  {
    id: "go",
    label: "Go",
    code: `package main

import (
  "fmt"
  "math/rand"
)

func calcDigit(digits []int, weightStart int) int {
  sum := 0
  for i, d := range digits {
    sum += d * (weightStart - i)
  }
  rem := sum % 11
  if rem < 2 {
    return 0
  }
  return 11 - rem
}

func generateCPF() string {
  base := make([]int, 9)
  for i := 0; i < 8; i++ {
    base[i] = rand.Intn(10)
  }
  base[8] = rand.Intn(10)
  d1 := calcDigit(base, 10)
  d2 := calcDigit(append(base, d1), 11)
  out := ""
  for _, d := range base {
    out += fmt.Sprintf("%d", d)
  }
  return fmt.Sprintf("%s%d%d", out, d1, d2)
}`,
  },
  {
    id: "php",
    label: "PHP",
    code: `<?php
function calc_digit(array $digits, int $weightStart): int {
  $sum = 0;
  foreach ($digits as $i => $d) {
    $sum += $d * ($weightStart - $i);
  }
  $rem = $sum % 11;
  return $rem < 2 ? 0 : 11 - $rem;
}

function generate_cpf(): string {
  $base = [];
  for ($i = 0; $i < 8; $i++) $base[] = random_int(0, 9);
  $base[] = random_int(0, 9);
  $d1 = calc_digit($base, 10);
  $d2 = calc_digit(array_merge($base, [$d1]), 11);
  return implode('', array_merge($base, [$d1, $d2]));
}

echo generate_cpf();`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `using System;
using System.Linq;

static int CalcDigit(int[] digits, int weightStart) {
  var sum = digits.Select((d, i) => d * (weightStart - i)).Sum();
  var rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

static string GenerateCpf() {
  var rnd = new Random();
  var base9 = Enumerable.Range(0, 8).Select(_ => rnd.Next(10)).ToList();
  base9.Add(rnd.Next(10));
  var d1 = CalcDigit(base9.ToArray(), 10);
  var d2 = CalcDigit(base9.Append(d1).ToArray(), 11);
  return string.Concat(base9) + d1 + d2;
}`,
  },
  {
    id: "ruby",
    label: "Ruby",
    code: `def calc_digit(digits, weight_start)
  sum = digits.each_with_index.sum { |d, i| d * (weight_start - i) }
  rem = sum % 11
  rem < 2 ? 0 : 11 - rem
end

def generate_cpf
  base = Array.new(8) { rand(0..9) } + [rand(0..9)]
  d1 = calc_digit(base, 10)
  d2 = calc_digit(base + [d1], 11)
  (base + [d1, d2]).join
end

puts generate_cpf`,
  },
  {
    id: "kotlin",
    label: "Kotlin",
    code: `fun calcDigit(digits: List<Int>, weightStart: Int): Int {
  val sum = digits.mapIndexed { i, d -> d * (weightStart - i) }.sum()
  val rem = sum % 11
  return if (rem < 2) 0 else 11 - rem
}

fun generateCpf(): String {
  val base = MutableList(8) { (0..9).random() }
  base += (0..9).random()
  val d1 = calcDigit(base, 10)
  val d2 = calcDigit(base + d1, 11)
  return (base + d1 + d2).joinToString("")
}`,
  },
  {
    id: "swift",
    label: "Swift",
    code: `func calcDigit(_ digits: [Int], weightStart: Int) -> Int {
  let sum = digits.enumerated().reduce(0) { $0 + $1.element * (weightStart - $1.offset) }
  let rem = sum % 11
  return rem < 2 ? 0 : 11 - rem
}

func generateCPF() -> String {
  var base = (0..<8).map { _ in Int.random(in: 0...9) }
  base.append(Int.random(in: 0...9))
  let d1 = calcDigit(base, weightStart: 10)
  let d2 = calcDigit(base + [d1], weightStart: 11)
  return (base + [d1, d2]).map(String.init).joined()
}`,
  },
] as const;
