import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SidebarNav({ sections = [], onNavigate = () => {} }) {
  const location = useLocation();

  return (
    <nav className="space-y-8">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onNavigate(item.to)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive || location.pathname === item.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )
                  }
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default SidebarNav;
