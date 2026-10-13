import { Link } from "@/i18n/navigation";

type Faq = { question: string; answer: string };

export function FaqSection({
  title,
  faqs,
}: {
  title: string;
  faqs: Faq[];
}) {
  return (
    <section className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <dl className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-medium text-slate-900 dark:text-white">
              {faq.question}
            </dt>
            <dd className="mt-1">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SeoArticle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-2">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </article>
  );
}

export function CrossToolLink({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 text-sm text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-slate-200">
      {hint}{" "}
      <Link
        href={href}
        className="font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
      >
        {label}
      </Link>
      .
    </p>
  );
}
