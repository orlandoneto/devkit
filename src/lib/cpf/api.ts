import { z } from "zod";
import { UF_LIST } from "@/lib/cpf";

const ufEnum = z.enum(["random", ...UF_LIST] as unknown as [string, ...string[]]);

export const cpfGenerateQuerySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  uf: ufEnum.default("random"),
  mask: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? true : v === true || v === "true")),
  state: ufEnum.optional(),
});

export const cpfValidateBodySchema = z.object({
  cpf: z.string().min(1, "Campo cpf é obrigatório"),
});
