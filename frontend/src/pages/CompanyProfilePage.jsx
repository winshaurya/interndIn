import { CompanyProfile } from "@/components/alumni/CompanyProfile";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function CompanyProfilePage() {
  useShellHeader({
    title: "Company Profile",
    description: "Preview how students experience your brand narrative and stats.",
  });

  return <CompanyProfile />;
}
