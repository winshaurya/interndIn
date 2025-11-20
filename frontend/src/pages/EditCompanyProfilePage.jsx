import { EditCompanyProfile } from "@/components/alumni/EditCompanyProfile";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function EditCompanyProfilePage() {
  useShellHeader({
    title: "Edit Company Details",
    description: "Keep your public profile fresh with accurate locations, culture, and contacts.",
  });

  return <EditCompanyProfile />;
}
