import { z } from "zod";

export const CustomerInfoSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;

export const ShippingAddressSchema = z.object({
  address_1: z.string().min(1, "Address line 1 is required"),
  address_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country_code: z.string().length(2, "2-letter ISO country code required"),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const PvzSelectionSchema = z.object({
  provider: z.enum(["cdek", "boxberry", "yandex"]),
  pvz_id: z.string().min(1, "PVZ ID is required"),
  address: z.string().min(1, "PVZ address is required"),
  name: z.string().optional(),
});
export type PvzSelection = z.infer<typeof PvzSelectionSchema>;

export const PaymentProviderEnum = z.enum(["tinkoff", "yookassa", "stripe"]);
export type PaymentProvider = z.infer<typeof PaymentProviderEnum>;

export const PaymentSelectionSchema = z.object({
  provider: PaymentProviderEnum,
  method: z.string().optional(),
});
export type PaymentSelection = z.infer<typeof PaymentSelectionSchema>;

export const LegalConsentSchema = z.object({
  terms_accepted: z.literal(true, {
    message: "Terms and conditions must be accepted",
  }),
  privacy_accepted: z.literal(true, {
    message: "Privacy policy must be accepted",
  }),
  consent_version: z.string().min(1, "Consent version is required"),
});
export type LegalConsent = z.infer<typeof LegalConsentSchema>;

export const CheckoutPayloadSchema = z.object({
  cart_id: z.string().min(1),
  customer: CustomerInfoSchema,
  shipping_address: ShippingAddressSchema.optional(),
  pvz: PvzSelectionSchema.optional(),
  payment: PaymentSelectionSchema,
  consent: LegalConsentSchema,
});
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
