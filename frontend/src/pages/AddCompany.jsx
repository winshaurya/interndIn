import { AddCompanyForm } from "@/components/alumni/AddCompanyForm";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function AddCompany() {
  useShellHeader({
    title: "Create Company Profile",
    description: "Capture the essentials so students can discover your organization.",
  });

  return <AddCompanyForm />;
}
