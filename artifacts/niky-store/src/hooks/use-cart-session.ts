import { useState, useEffect } from "react";

const SESSION_KEY = "niky-session-id";

export function useCartSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let storedSession = localStorage.getItem(SESSION_KEY);
    if (!storedSession) {
      storedSession = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, storedSession);
    }
    setSessionId(storedSession);
  }, []);

  return { sessionId };
}