import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppShell from "@/components/shell/AppShell";
import { navigation } from "@/config/navigation";
import { Button } from "@/components/ui/button";

export function AlumniLayout() {
  const [headerMeta, setHeaderMeta] = useState({
    title: "Alumni Workspace",
    description: "Monitor postings, applicants, and company presence.",
  });
  const navigate = useNavigate();

  return (
    <AppShell
      role="alumni"
      navSections={navigation.alumni}
      pageTitle={headerMeta.title}
      pageDescription={headerMeta.description}
      headerActions={
        <Button size="sm" onClick={() => navigate("/alumni/post-job")}>
          Post a job
        </Button>
      }
    >
      <Outlet context={{ setHeaderMeta }} />
    </AppShell>
  );
}
