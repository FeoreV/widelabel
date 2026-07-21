import { config } from "@wide-label/config";
export function getBackendStatus() {
    return {
        status: "ok",
        env: config.env,
    };
}
