import { JobApplicants } from "@/components/alumni/JobApplicants";
import { useShellHeader } from "@/hooks/useShellHeader";

const JobApplicantsPage = () => {
  useShellHeader({
    title: "Applicants & Reviews",
    description: "Score, filter, and connect with talent applying to your roles.",
  });

  return <JobApplicants />;
};

export default JobApplicantsPage;
