import { z } from "zod";

export const JoinWaitlistPayloadSchema = z.object({
  variant_id: z.string().min(1, "Variant ID is required"),
  email: z.string().email("Valid email is required"),
  channel: z.enum(["email", "telegram", "both"]).default("email"),
});

export type JoinWaitlistPayload = z.infer<typeof JoinWaitlistPayloadSchema>;

export interface JoinWaitlistResponse {
  success: boolean;
  message: string;
  waitlist_id?: string;
}

export interface IWaitlistAdapter {
  joinWaitlist(payload: JoinWaitlistPayload): Promise<JoinWaitlistResponse>;
}

export class ApiWaitlistAdapter implements IWaitlistAdapter {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async joinWaitlist(
    rawPayload: JoinWaitlistPayload
  ): Promise<JoinWaitlistResponse> {
    const payload = JoinWaitlistPayloadSchema.parse(rawPayload);

    const response = await fetch(`${this.baseUrl}/store/wide-label/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to join waitlist (${response.status})`);
    }

    return response.json();
  }
}
