import { config } from "@wide-label/config";
export function getStorefrontStatus() {
    return {
        status: "ok",
        env: config.env,
    };
}
