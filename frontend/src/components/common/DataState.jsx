import { Loader2, Inbox, TriangleAlert } from "lucide-react";

const icons = {
  loading: Loader2,
  empty: Inbox,
  error: TriangleAlert,
};

export function DataState({ state = "loading", message = "", description = "", action = null }) {
  const Icon = icons[state] || Loader2;
  const isLoading = state === "loading";

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3 text-muted-foreground">
      <Icon className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
      {message && <p className="font-medium text-foreground">{message}</p>}
      {description && <p className="text-sm text-muted-foreground/80 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export default DataState;
