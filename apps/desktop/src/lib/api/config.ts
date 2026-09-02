import { DEFAULT_SERVER_URL } from "@the-center/shared";

export function getServerUrl(env: ImportMetaEnv = import.meta.env): string {
  const raw = env.VITE_SERVER_URL?.trim();
  if (raw) return raw;
  return DEFAULT_SERVER_URL;
}
