import { PostJob } from "@/components/alumni/PostJob";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function PostJobPage() {
  useShellHeader({
    title: "Post a Role",
    description: "Craft an attractive posting with eligibility, compensation, and custom questions.",
  });

  return <PostJob />;
}
