import { NextResponse } from "next/server";

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "devKit API",
    version: "1.0.0",
    description: "APIs REST do portal devKit — documentos e utilitários.",
  },
  paths: {
    "/api/v1/cpf": {
      get: {
        summary: "Gerar CPF",
        parameters: [
          { name: "quantity", in: "query", schema: { type: "integer" } },
          { name: "uf", in: "query", schema: { type: "string" } },
          { name: "mask", in: "query", schema: { type: "boolean" } },
        ],
      },
    },
    "/api/v1/cpf/validate": { post: { summary: "Validar CPF" } },
    "/api/v1/cnpj": { get: { summary: "Gerar CNPJ" } },
    "/api/v1/cnpj/validate": { post: { summary: "Validar CNPJ" } },
    "/api/v1/rg": { get: { summary: "Gerar RG fictício" } },
    "/api/v1/uuid": { get: { summary: "Gerar UUID v4" } },
    "/api/v1/senha": { get: { summary: "Gerar senha" } },
  },
};

export async function GET() {
  return NextResponse.json(openapi);
}
