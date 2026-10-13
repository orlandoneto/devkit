import assert from "node:assert/strict";
import test from "node:test";
import {
  InvalidEmailDomainError,
  MAX_EMAIL_QUANTITY,
  generateEmails,
  isReservedTestDomain,
  normalizeDomain,
  type EmailRandom,
} from "./index";

function seeded(seed: number): EmailRandom {
  let state = seed >>> 0;
  return {
    int(max: number) {
      if (max <= 1) return 0;
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state % max;
    },
  };
}

test("normalizeDomain aceita host, URL e endereço e rejeita lixo", () => {
  assert.equal(normalizeDomain("  Example.COM "), "example.com");
  assert.equal(normalizeDomain("https://Example.ORG/path?q=1"), "example.org");
  assert.equal(normalizeDomain("user@Mail.Example:25"), "mail.example");
  assert.equal(normalizeDomain("example.com."), "example.com");
  assert.equal(normalizeDomain("localhost"), "localhost");
  assert.equal(normalizeDomain(""), null);
  assert.equal(normalizeDomain("não é domínio"), null);
  assert.equal(normalizeDomain("-invalido.com"), null);
});

test("isReservedTestDomain reconhece espaços da RFC 2606 e 6761", () => {
  assert.equal(isReservedTestDomain("example.com"), true);
  assert.equal(isReservedTestDomain("qa.example.org"), true);
  assert.equal(isReservedTestDomain("app.test"), true);
  assert.equal(isReservedTestDomain("mail.example"), true);
  assert.equal(isReservedTestDomain("inbox.invalid"), true);
  assert.equal(isReservedTestDomain("api.localhost"), true);
  assert.equal(isReservedTestDomain("localhost"), true);
  assert.equal(isReservedTestDomain("gmail.com"), false);
  assert.equal(isReservedTestDomain("empresa.com.br"), false);
});

test("generateEmails respeita quantidade, domínio, formato e unicidade", () => {
  const dotted = generateEmails({
    quantity: 8,
    domain: "example.com",
    format: "nome.sobrenome",
    random: seeded(7),
  });
  assert.equal(dotted.length, 8);
  assert.equal(new Set(dotted).size, 8);
  for (const email of dotted) {
    assert.match(email, /^[a-z]+\.[a-z]+@example\.com$/);
  }

  const underlined = generateEmails({
    quantity: 3,
    domain: "https://example.net/ignorar",
    format: "nome_sobrenome",
    random: seeded(3),
  });
  for (const email of underlined) {
    assert.match(email, /^[a-z]+_[a-z]+@example\.net$/);
  }

  const initial = generateEmails({
    quantity: 3,
    format: "inicial.sobrenome",
    random: seeded(9),
  });
  for (const email of initial) {
    assert.match(email, /^[a-z]\.[a-z]+@example\.com$/);
  }

  const numbered = generateEmails({
    quantity: 3,
    format: "nome.numero",
    random: seeded(11),
  });
  for (const email of numbered) {
    assert.match(email, /^[a-z]+\.\d{4}@example\.com$/);
  }

  const randomLocal = generateEmails({
    quantity: 5,
    format: "aleatorio",
    domain: "equipe.example",
    random: seeded(13),
  });
  for (const email of randomLocal) {
    assert.match(email, /^[a-z][a-z0-9]{7,11}@equipe\.example$/);
  }
});

test("generateEmails limita a quantidade e falha com domínio inválido", () => {
  assert.equal(
    generateEmails({ quantity: 0, random: seeded(1) }).length,
    1,
  );
  assert.equal(
    generateEmails({ quantity: 500, random: seeded(1) }).length,
    MAX_EMAIL_QUANTITY,
  );
  assert.throws(
    () => generateEmails({ domain: "sem-ponto", random: seeded(1) }),
    InvalidEmailDomainError,
  );
});

test("o mesmo seed produz a mesma lista", () => {
  const first = generateEmails({
    quantity: 4,
    format: "aleatorio",
    random: seeded(42),
  });
  const second = generateEmails({
    quantity: 4,
    format: "aleatorio",
    random: seeded(42),
  });
  assert.deepEqual(first, second);
});
