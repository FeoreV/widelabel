import { config } from "@wide-label/config";

export function getStorefrontStatus(): { status: string; env: string } {
  return {
    status: "ok",
    env: config.env,
  };
}
