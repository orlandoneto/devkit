import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

const linkClass =
  "font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(LINK_RE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));

    const label = match[1] ?? "";
    const href = match[2] ?? "";
    const key = `${keyPrefix}-${index}`;

    if (href.startsWith("/")) {
      nodes.push(
        <Link key={key} href={href} className={linkClass}>
          {label}
        </Link>,
      );
    } else if (href.startsWith("mailto:") || href.startsWith("https://")) {
      nodes.push(
        <a
          key={key}
          href={href}
          className={linkClass}
          {...(href.startsWith("https://")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(<Fragment key={key}>{match[0]}</Fragment>);
    }

    last = start + match[0].length;
    index += 1;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Parágrafos separados por linha em branco; linhas "- " viram lista. Links: [texto](/caminho). */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter((block) => block.trim().length > 0);

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const isList =
          lines.length > 0 && lines.every((line) => line.startsWith("- "));

        if (isList) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1.5 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`${blockIndex}-${lineIndex}`}>
                  {renderInline(line.slice(2), `b${blockIndex}-i${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex}>
            {renderInline(lines.join(" "), `b${blockIndex}`)}
          </p>
        );
      })}
    </>
  );
}
