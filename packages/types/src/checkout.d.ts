import { z } from "zod";
export declare const CustomerInfoSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
}, z.core.$strip>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export declare const ShippingAddressSchema: z.ZodObject<{
    address_1: z.ZodString;
    address_2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    province: z.ZodOptional<z.ZodString>;
    postal_code: z.ZodString;
    country_code: z.ZodString;
}, z.core.$strip>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export declare const PvzSelectionSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        cdek: "cdek";
        boxberry: "boxberry";
        yandex: "yandex";
    }>;
    pvz_id: z.ZodString;
    address: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PvzSelection = z.infer<typeof PvzSelectionSchema>;
export declare const PaymentProviderEnum: z.ZodEnum<{
    tinkoff: "tinkoff";
    yookassa: "yookassa";
    stripe: "stripe";
}>;
export type PaymentProvider = z.infer<typeof PaymentProviderEnum>;
export declare const PaymentSelectionSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        tinkoff: "tinkoff";
        yookassa: "yookassa";
        stripe: "stripe";
    }>;
    method: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PaymentSelection = z.infer<typeof PaymentSelectionSchema>;
export declare const LegalConsentSchema: z.ZodObject<{
    terms_accepted: z.ZodLiteral<true>;
    privacy_accepted: z.ZodLiteral<true>;
    consent_version: z.ZodString;
}, z.core.$strip>;
export type LegalConsent = z.infer<typeof LegalConsentSchema>;
export declare const CheckoutPayloadSchema: z.ZodObject<{
    cart_id: z.ZodString;
    customer: z.ZodObject<{
        email: z.ZodString;
        phone: z.ZodString;
        first_name: z.ZodString;
        last_name: z.ZodString;
    }, z.core.$strip>;
    shipping_address: z.ZodOptional<z.ZodObject<{
        address_1: z.ZodString;
        address_2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodString;
        country_code: z.ZodString;
    }, z.core.$strip>>;
    pvz: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<{
            cdek: "cdek";
            boxberry: "boxberry";
            yandex: "yandex";
        }>;
        pvz_id: z.ZodString;
        address: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    payment: z.ZodObject<{
        provider: z.ZodEnum<{
            tinkoff: "tinkoff";
            yookassa: "yookassa";
            stripe: "stripe";
        }>;
        method: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    consent: z.ZodObject<{
        terms_accepted: z.ZodLiteral<true>;
        privacy_accepted: z.ZodLiteral<true>;
        consent_version: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
