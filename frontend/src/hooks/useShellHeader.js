import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export function useShellHeader(meta) {
  const outletContext = useOutletContext();

  useEffect(() => {
    if (!meta?.title) return;
    outletContext?.setHeaderMeta?.({
      title: meta.title,
      description: meta.description || "",
    });
  }, [outletContext, meta?.title, meta?.description]);
}

export default useShellHeader;
