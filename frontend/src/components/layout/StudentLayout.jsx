import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppShell from "@/components/shell/AppShell";
import { navigation } from "@/config/navigation";

function StudentLayout() {
  const [headerMeta, setHeaderMeta] = useState({
    title: "Dashboard",
    description: "Track your progress and opportunities",
  });

  return (
    <AppShell
      role="student"
      navSections={navigation.student}
      pageTitle={headerMeta.title}
      pageDescription={headerMeta.description}
    >
      <Outlet context={{ setHeaderMeta }} />
    </AppShell>
  );
}

export default StudentLayout;
