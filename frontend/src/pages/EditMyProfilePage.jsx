import { EditMyProfile } from "@/components/alumni/EditMyProfile";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function EditMyProfilePage() {
  useShellHeader({
    title: "My Alumni Profile",
    description: "Update your professional story, availability, and consent settings.",
  });

  return <EditMyProfile />;
}
