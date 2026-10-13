import {
  generateLegalMetadata,
  LegalPage,
} from "@/components/legal/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return generateLegalMetadata({
    params,
    namespace: "About",
    path: "/sobre",
  });
}

export default async function SobrePage({ params }: Props) {
  return (
    <LegalPage
      params={params}
      namespace="About"
      path="/sobre"
      schemaType="AboutPage"
      sectionCount={8}
    />
  );
}
