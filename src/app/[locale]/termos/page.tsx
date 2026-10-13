import {
  generateLegalMetadata,
  LegalPage,
} from "@/components/legal/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generateLegalMetadata({
    params,
    namespace: "Terms",
    path: "/termos",
  });
}

export default async function TermosPage({ params }: Props) {
  return (
    <LegalPage
      params={params}
      namespace="Terms"
      path="/termos"
      schemaType="WebPage"
      sectionCount={8}
    />
  );
}
