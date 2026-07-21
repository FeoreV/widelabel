export async function initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, yookassaClient, input) {
    // Idempotency check: Return existing payment attempt if already processed for this idempotency_key
    const existingAttempt = paymentAttemptRepo.findByIdempotencyKey(input.idempotency_key);
    if (existingAttempt) {
        return {
            payment_attempt: existingAttempt,
            confirmation_url: `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${existingAttempt.external_payment_id || existingAttempt.id}`,
        };
    }
    // Validate active reservation
    const reservation = await reservationRepo.findById(input.reservation_id);
    if (!reservation) {
        throw new Error(`Reservation ${input.reservation_id} not found`);
    }
    if (reservation.cart_id !== input.cart_id) {
        throw new Error("Reservation cart ID mismatch");
    }
    if (reservation.status !== "active" && reservation.status !== "payment_pending") {
        throw new Error(`Cannot initiate payment for reservation with status '${reservation.status}'`);
    }
    // Transition status to payment_pending
    if (reservation.status === "active") {
        await reservationRepo.updateStatus(reservation.id, "payment_pending");
    }
    // Call external provider (YooKassa)
    const yooPayment = await yookassaClient.createPayment({
        amount: {
            value: (input.amount / 100).toFixed(2),
            currency: input.currency_code,
        },
        confirmation: {
            type: "redirect",
            return_url: input.return_url,
        },
        capture: true,
        description: `Order for reservation ${reservation.id}`,
        idempotency_key: input.idempotency_key,
    });
    const paymentAttempt = paymentAttemptRepo.create({
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        idempotency_key: input.idempotency_key,
        cart_id: input.cart_id,
        reservation_id: input.reservation_id,
        provider: input.provider,
        amount: input.amount,
        currency_code: input.currency_code,
        status: "pending",
        external_payment_id: yooPayment.id,
        created_at: new Date(),
        updated_at: new Date(),
    });
    return {
        payment_attempt: paymentAttempt,
        confirmation_url: yooPayment.confirmation?.confirmation_url || "",
    };
}
