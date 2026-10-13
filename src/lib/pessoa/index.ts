import { generateCNH } from "@/lib/cnh";
import { generateCPF } from "@/lib/cpf";
import { generateRG } from "@/lib/rg";
import type { BrazilianUF } from "@/lib/cpf/region";
import { UF_LIST } from "@/lib/cpf/region";

export type PersonSex = "M" | "F" | "random";

export type GeneratedPerson = {
  nome: string;
  sexo: "Masculino" | "Feminino";
  dataNascimento: string;
  idade: number;
  cpf: string;
  rg: string;
  cnh: string;
  email: string;
  celular: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: BrazilianUF;
  mae: string;
  pai: string;
  senha: string;
};

const FIRST_M = [
  "João",
  "Pedro",
  "Lucas",
  "Gabriel",
  "Rafael",
  "Bruno",
  "Felipe",
  "Mateus",
  "Thiago",
  "André",
  "Carlos",
  "Eduardo",
  "Gustavo",
  "Henrique",
  "Igor",
  "Leandro",
  "Marcelo",
  "Nicolas",
  "Otávio",
  "Paulo",
];

const FIRST_F = [
  "Ana",
  "Maria",
  "Julia",
  "Beatriz",
  "Larissa",
  "Camila",
  "Fernanda",
  "Patricia",
  "Amanda",
  "Bruna",
  "Carla",
  "Daniela",
  "Eduarda",
  "Gabriela",
  "Helena",
  "Isabela",
  "Letícia",
  "Mariana",
  "Natália",
  "Paula",
];

const MID = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Almeida",
  "Pereira",
  "Lima",
  "Gomes",
  "Costa",
  "Ribeiro",
  "Martins",
  "Carvalho",
  "Rocha",
  "Araujo",
  "Melo",
  "Barbosa",
  "Nunes",
  "Moreira",
];

const STREETS = [
  "Rua das Flores",
  "Av. Brasil",
  "Rua São Paulo",
  "Rua das Palmeiras",
  "Av. Paulista",
  "Rua XV de Novembro",
  "Rua Dom Pedro II",
  "Av. Getúlio Vargas",
  "Rua das Acácias",
  "Rua Boa Vista",
  "Av. Atlântica",
  "Rua Sete de Setembro",
  "Rua das Laranjeiras",
  "Av. Independência",
  "Rua Marechal Deodoro",
];

const NEIGHBORHOODS = [
  "Centro",
  "Jardim América",
  "Vila Nova",
  "Bela Vista",
  "Santa Clara",
  "Parque Industrial",
  "Alto da Colina",
  "Jardim Europa",
  "Vila Oliveira",
  "São José",
];

/** Cidades fictícias/realistas por UF para fixtures (sem consulta a Correios). */
const CITIES: Record<BrazilianUF, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AL: ["Maceió", "Arapiraca"],
  AM: ["Manaus", "Parintins"],
  AP: ["Macapá", "Santana"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  CE: ["Fortaleza", "Juazeiro do Norte", "Sobral"],
  DF: ["Brasília", "Ceilândia", "Taguatinga"],
  ES: ["Vitória", "Vila Velha", "Serra"],
  GO: ["Goiânia", "Anápolis", "Aparecida de Goiânia"],
  MA: ["São Luís", "Imperatriz"],
  MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem"],
  MS: ["Campo Grande", "Dourados"],
  MT: ["Cuiabá", "Várzea Grande"],
  PA: ["Belém", "Ananindeua", "Santarém"],
  PB: ["João Pessoa", "Campina Grande"],
  PE: ["Recife", "Olinda", "Caruaru"],
  PI: ["Teresina", "Parnaíba"],
  PR: ["Curitiba", "Londrina", "Maringá"],
  RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
  RN: ["Natal", "Mossoró"],
  RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  SC: ["Florianópolis", "Joinville", "Blumenau"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"],
  SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "São José dos Campos"],
  TO: ["Palmas", "Araguaína"],
};

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n: number, size = 2) {
  return String(n).padStart(size, "0");
}

function slugifyEmail(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function buildBirthDate(age: number) {
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${pad(day)}/${pad(month)}/${year}`;
}

function buildCep(uf: BrazilianUF) {
  // Prefixo sintético só para parecer CEP BR — não consulta Correios
  const seed = (UF_LIST.indexOf(uf) + 1) * 1111 + randomInt(100, 899);
  const base = String(10000000 + (seed % 89999999)).padStart(8, "0");
  return `${base.slice(0, 5)}-${base.slice(5)}`;
}

function buildPhone(uf: BrazilianUF, mobile: boolean) {
  const dddByRegion: Partial<Record<BrazilianUF, number>> = {
    SP: 11,
    RJ: 21,
    MG: 31,
    RS: 51,
    PR: 41,
    SC: 48,
    BA: 71,
    PE: 81,
    CE: 85,
    DF: 61,
    GO: 62,
    AM: 92,
    PA: 91,
  };
  const ddd = dddByRegion[uf] ?? pick([11, 21, 31, 41, 51, 61, 71, 81]);
  if (mobile) {
    const rest = `${randomInt(90000, 99999)}-${randomInt(1000, 9999)}`;
    return `(${ddd}) 9${rest}`;
  }
  return `(${ddd}) ${randomInt(2000, 5999)}-${randomInt(1000, 9999)}`;
}

function buildPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  return Array.from({ length: 10 }, () => pick(chars.split(""))).join("");
}

export type GeneratePersonOptions = {
  sex?: PersonSex;
  age?: number | "random";
  uf?: BrazilianUF | "random";
  mask?: boolean;
};

export function generatePerson(
  options: GeneratePersonOptions = {},
): GeneratedPerson {
  const mask = options.mask ?? true;
  const sexRoll =
    options.sex === "random" || !options.sex
      ? Math.random() < 0.5
        ? "M"
        : "F"
      : options.sex;
  const sexo = sexRoll === "M" ? "Masculino" : "Feminino";
  const first = pick(sexRoll === "M" ? FIRST_M : FIRST_F);
  const mid = pick(MID);
  const last = pick(MID.filter((item) => item !== mid));
  const nome = `${first} ${mid} ${last}`;

  const age =
    options.age === "random" || options.age == null
      ? randomInt(18, 65)
      : Math.min(90, Math.max(18, options.age));

  const uf =
    options.uf === "random" || !options.uf ? pick(UF_LIST) : options.uf;
  const cidade = pick(CITIES[uf]);
  const cpf = generateCPF({ uf, mask: true });
  const rg = generateRG(true);
  const cnh = generateCNH(true);

  const emailLocal = `${slugifyEmail(nome)}.${randomInt(10, 99)}`;
  const email = `${emailLocal}@emailteste.com.br`;

  return {
    nome,
    sexo,
    dataNascimento: buildBirthDate(age),
    idade: age,
    cpf: mask ? cpf.formatted : cpf.cpf,
    rg: mask ? rg.formatted : rg.rg,
    cnh: mask ? cnh.formatted : cnh.cnh,
    email,
    celular: buildPhone(uf, true),
    telefone: buildPhone(uf, false),
    cep: buildCep(uf),
    endereco: pick(STREETS),
    numero: String(randomInt(10, 9999)),
    bairro: pick(NEIGHBORHOODS),
    cidade,
    estado: uf,
    mae: `${pick(FIRST_F)} ${mid}`,
    pai: `${pick(FIRST_M)} ${last}`,
    senha: buildPassword(),
  };
}

export function personToPlainText(person: GeneratedPerson) {
  return [
    `Nome: ${person.nome}`,
    `Sexo: ${person.sexo}`,
    `Nascimento: ${person.dataNascimento} (${person.idade} anos)`,
    `CPF: ${person.cpf}`,
    `RG: ${person.rg}`,
    `CNH: ${person.cnh}`,
    `E-mail: ${person.email}`,
    `Celular: ${person.celular}`,
    `Telefone: ${person.telefone}`,
    `CEP: ${person.cep}`,
    `Endereço: ${person.endereco}, ${person.numero}`,
    `Bairro: ${person.bairro}`,
    `Cidade/UF: ${person.cidade}/${person.estado}`,
    `Mãe: ${person.mae}`,
    `Pai: ${person.pai}`,
    `Senha: ${person.senha}`,
  ].join("\n");
}
