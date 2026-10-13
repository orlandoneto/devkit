import {
  generateLegalMetadata,
  LegalPage,
} from "@/components/legal/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generateLegalMetadata({
    params,
    namespace: "Privacy",
    path: "/privacidade",
  });
}

export default async function PrivacidadePage({ params }: Props) {
  return (
    <LegalPage
      params={params}
      namespace="Privacy"
      path="/privacidade"
      schemaType="WebPage"
      sectionCount={9}
    />
  );
}
