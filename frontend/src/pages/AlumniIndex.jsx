import AlumniDashboard from "@/components/alumni/AlumniDashboard";
import { useShellHeader } from "@/hooks/useShellHeader";

const AlumniIndex = () => {
  useShellHeader({
    title: "Alumni Overview",
    description: "Snapshot of your postings, company traction, and applicant activity.",
  });

  return <AlumniDashboard />;
};

export default AlumniIndex;
