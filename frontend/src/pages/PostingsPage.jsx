import { ActivePostings } from "@/components/alumni/ActivePostings";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function PostingsPage() {
  useShellHeader({
    title: "Manage Postings",
    description: "Track live roles, filter by pipeline health, and take action quickly.",
  });

  return <ActivePostings />;
}
