import { createValueHistoryStore } from "@/store/create-value-history-store";

export const useCnpjHistoryStore = createValueHistoryStore("devkit-cnpj-history");
export const useRgHistoryStore = createValueHistoryStore("devkit-rg-history");
export const useUuidHistoryStore = createValueHistoryStore("devkit-uuid-history");
export const useSenhaHistoryStore = createValueHistoryStore("devkit-senha-history");
export const useEmailHistoryStore = createValueHistoryStore("devkit-email-history");
export const usePessoaHistoryStore = createValueHistoryStore(
  "devkit-pessoa-history",
);
