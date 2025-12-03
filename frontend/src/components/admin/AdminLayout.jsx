import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppShell from "@/components/shell/AppShell";
import { navigation } from "@/config/navigation";

function AdminLayout() {
  const [headerMeta, setHeaderMeta] = useState({
    title: "Admin Console",
    description: "Monitor platform health and moderate activity.",
  });

  return (
    <AppShell
      role="admin"
      navSections={navigation.admin}
      pageTitle={headerMeta.title}
      pageDescription={headerMeta.description}
    >
      <Outlet context={{ setHeaderMeta }} />
    </AppShell>
  );
}

export default AdminLayout;
