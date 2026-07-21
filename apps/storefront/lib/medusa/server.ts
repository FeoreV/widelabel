import { MedusaStorefrontClient } from "./client";

export function getMedusaServerClient(): MedusaStorefrontClient {
  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_URL ||
    "http://localhost:9000";
  return new MedusaStorefrontClient(backendUrl);
}
