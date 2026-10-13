"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, FileJson, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { InfoTip } from "@/components/ui/tooltip";
import {
  generatePerson,
  type GeneratedPerson,
  type PersonSex,
} from "@/lib/pessoa";
import { UF_LIST, type BrazilianUF } from "@/lib/cpf/region";
import { copyToClipboard, downloadBlob } from "@/lib/utils";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import { usePessoaHistoryStore } from "@/store/tool-history-stores";

const FIELD_KEYS = [
  "nome",
  "sexo",
  "dataNascimento",
  "idade",
  "cpf",
  "rg",
  "cnh",
  "email",
  "celular",
  "telefone",
  "cep",
  "endereco",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "mae",
  "pai",
  "senha",
] as const satisfies readonly (keyof GeneratedPerson)[];

export function PersonGenerator() {
  const t = useTranslations("Pessoa");
  const [sex, setSex] = useState<PersonSex>("random");
  const [age, setAge] = useState<number | "random">("random");
  const [uf, setUf] = useState<BrazilianUF | "random">("random");
  const [mask, setMask] = useState(true);
  const [person, setPerson] = useState<GeneratedPerson | null>(null);
  const history = usePessoaHistoryStore((s) => s.history);
  const used = usePessoaHistoryStore((s) => s.used);
  const pushGenerated = usePessoaHistoryStore((s) => s.pushGenerated);
  const markUsed = usePessoaHistoryStore((s) => s.markUsed);
  const clearHistory = usePessoaHistoryStore((s) => s.clearHistory);

  function personId(p: GeneratedPerson) {
    return p.cpf.replace(/\D/g, "");
  }

  function personDisplay(p: GeneratedPerson) {
    return `${p.nome} · ${p.cpf}`;
  }

  function generate(save = true) {
    const next = generatePerson({ sex, age, uf, mask });
    setPerson(next);
    if (save) {
      pushGenerated([{ id: personId(next), display: personDisplay(next) }]);
    }
    return next;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function displayValue(key: keyof GeneratedPerson, value: string | number) {
    if (key === "sexo") {
      return value === "Masculino" ? t("sexMale") : t("sexFemale");
    }
    return String(value);
  }

  function toPlainText(p: GeneratedPerson) {
    return [
      `${t("fields.nome")}: ${p.nome}`,
      `${t("fields.sexo")}: ${displayValue("sexo", p.sexo)}`,
      `${t("fields.dataNascimento")}: ${t("plainBirth", { date: p.dataNascimento, age: p.idade })}`,
      `${t("fields.cpf")}: ${p.cpf}`,
      `${t("fields.rg")}: ${p.rg}`,
      `${t("fields.cnh")}: ${p.cnh}`,
      `${t("fields.email")}: ${p.email}`,
      `${t("fields.celular")}: ${p.celular}`,
      `${t("fields.telefone")}: ${p.telefone}`,
      `${t("fields.cep")}: ${p.cep}`,
      `${t("fields.endereco")}: ${t("plainAddress", { street: p.endereco, number: p.numero })}`,
      `${t("fields.bairro")}: ${p.bairro}`,
      `${t("fields.cidade")}: ${t("plainCityUf", { city: p.cidade, uf: p.estado })}`,
      `${t("fields.mae")}: ${p.mae}`,
      `${t("fields.pai")}: ${p.pai}`,
      `${t("fields.senha")}: ${p.senha}`,
    ].join("\n");
  }

  async function copyField(label: string, value: string | number) {
    await copyToClipboard(String(value));
    if (person) {
      markUsed({ id: personId(person), display: personDisplay(person) });
    }
    toast.success(t("toastFieldCopied", { label }));
  }

  async function copyAll() {
    if (!person) return;
    await copyToClipboard(toPlainText(person));
    markUsed({ id: personId(person), display: personDisplay(person) });
    toast.success(t("toastAllCopied"));
  }

  function downloadJson() {
    if (!person) return;
    downloadBlob(
      `pessoa-${person.cpf.replace(/\D/g, "")}.json`,
      JSON.stringify(person, null, 2),
      "application/json",
    );
    toast.success(t("toastJson"));
  }

  return (
    <div>
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <div className="mt-3 flex flex-wrap items-end gap-2.5">
        <div className="space-y-1">
          <Label htmlFor="person-sex">{t("sex")}</Label>
          <Select
            id="person-sex"
            className="w-[140px]"
            value={sex}
            onChange={(e) => setSex(e.target.value as PersonSex)}
          >
            <option value="random">{t("sexRandom")}</option>
            <option value="M">{t("sexMale")}</option>
            <option value="F">{t("sexFemale")}</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="person-age" className="inline-flex items-center gap-1">
            {t("age")}
            <InfoTip text={t("ageTip")} />
          </Label>
          <Select
            id="person-age"
            className="w-[120px]"
            value={String(age)}
            onChange={(e) =>
              setAge(
                e.target.value === "random"
                  ? "random"
                  : Number(e.target.value),
              )
            }
          >
            <option value="random">{t("ageRandom")}</option>
            {Array.from({ length: 63 }, (_, i) => i + 18).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="person-uf">{t("uf")}</Label>
          <Select
            id="person-uf"
            className="w-[120px]"
            value={uf}
            onChange={(e) =>
              setUf(e.target.value as BrazilianUF | "random")
            }
          >
            <option value="random">{t("ufRandom")}</option>
            {UF_LIST.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </div>

        <label className="mb-2 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={mask}
            onChange={(e) => setMask(e.target.checked)}
            className="h-4 w-4 rounded accent-slate-900"
          />
          {t("withPunctuation")}
        </label>

        <Button size="sm" className="h-10" onClick={() => generate()}>
          <Wand2 className="h-3.5 w-3.5" />
          {t("generate")}
        </Button>
      </div>

      {person && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={copyAll}>
              <Copy className="h-3.5 w-3.5" />
              {t("copyAll")}
            </Button>
            <Button size="sm" variant="outline" onClick={downloadJson}>
              <FileJson className="h-3.5 w-3.5" />
              JSON
            </Button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FIELD_KEYS.map((key) => {
              const label = t(`fields.${key}`);
              const value = displayValue(key, person[key]);
              return (
                <div
                  key={key}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 px-2.5 py-2 dark:border-stone-800 dark:bg-stone-900/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-400">
                      {label}
                    </p>
                    <p className="truncate font-mono text-sm text-slate-900 dark:text-white">
                      {value}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("copyFieldAria", { label })}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-slate-950"
                    onClick={() => copyField(label, value)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ToolShell>

      <LocalHistoryPanel
        history={history}
        used={used}
        onClear={clearHistory}
        onCopy={async (item) => {
          await copyToClipboard(item.display);
          markUsed(item);
          toast.success(t("toastAllCopied"));
        }}
      />
    </div>
  );
}
