import { useEffect, useSyncExternalStore } from "react";
import { authStore } from "@/lib/api";

export function useSession() {
  const session = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );

  useEffect(() => {
    authStore.hydrate();
  }, []);

  return session;
}
