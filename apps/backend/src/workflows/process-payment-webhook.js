export async function processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, yookassaClient, input) {
    // 1. Server-side verification: Fetch verified status directly from YooKassa (never trust payload alone)
    const verifiedPayment = await yookassaClient.getPayment(input.provider_payment_id);
    // 2. Find matching PaymentAttempt
    const attempt = paymentAttemptRepo.findByIdempotencyKey(verifiedPayment.metadata?.idempotency_key || "") || Array.from(paymentAttemptRepo.attemptsById.values()).find((a) => a.external_payment_id === input.provider_payment_id);
    if (!attempt) {
        throw new Error(`No PaymentAttempt found for external payment ID '${input.provider_payment_id}'`);
    }
    // Idempotency: If already succeeded, return immediately
    if (attempt.status === "succeeded") {
        return {
            payment_attempt: attempt,
            status: "already_processed",
        };
    }
    // 3. Amount and currency validation
    const verifiedAmountCents = Math.round(parseFloat(verifiedPayment.amount.value) * 100);
    if (verifiedAmountCents !== attempt.amount ||
        verifiedPayment.amount.currency !== attempt.currency_code) {
        paymentAttemptRepo.updateStatus(attempt.id, "failed");
        throw new Error(`Payment amount/currency mismatch. Expected ${attempt.amount} ${attempt.currency_code}, got ${verifiedAmountCents} ${verifiedPayment.amount.currency}`);
    }
    const reservation = await reservationRepo.findById(attempt.reservation_id);
    if (!reservation) {
        throw new Error(`Reservation '${attempt.reservation_id}' not found`);
    }
    // 4. Handle provider status
    if (verifiedPayment.status === "succeeded" && verifiedPayment.paid) {
        const updatedAttempt = paymentAttemptRepo.updateStatus(attempt.id, "succeeded");
        await reservationRepo.updateStatus(reservation.id, "converted", {
            converted_at: new Date(),
        });
        return {
            payment_attempt: updatedAttempt,
            status: "converted",
        };
    }
    else if (verifiedPayment.status === "canceled") {
        const updatedAttempt = paymentAttemptRepo.updateStatus(attempt.id, "canceled");
        await reservationRepo.updateStatus(reservation.id, "released", {
            released_at: new Date(),
            release_reason: "payment_canceled",
        });
        return {
            payment_attempt: updatedAttempt,
            status: "failed",
        };
    }
    return {
        payment_attempt: attempt,
        status: "already_processed",
    };
}
