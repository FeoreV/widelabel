import { config } from "@wide-label/config";

export function getBackendStatus(): { status: string; env: string } {
  return {
    status: "ok",
    env: config.env,
  };
}
