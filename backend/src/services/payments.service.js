const { pool } = require('../config/database');
const pagarme = require('./pagarme.service');

async function initiatePayment(serviceId, requesterId, { paymentMethod, cardData }) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND requester_id = $2 AND status = 'accepted'`,
    [serviceId, requesterId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado ou não aceito'), { status: 404 });
  const s = svc[0];
  if (!s.agreed_price) throw Object.assign(new Error('Preço não acordado'), { status: 400 });

  const { amountService, amountFee, amountTotal } = pagarme.calculateAmounts(s.agreed_price);

  const txn = await pagarme.createTransaction({
    serviceId,
    amount: amountTotal,
    paymentMethod,
    cardData,
  });

  const { rows: pay } = await pool.query(
    `INSERT INTO payments (service_id, pagarme_transaction_id, amount_service, amount_fee, amount_total, payment_method, status, held_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'held', NOW())
     RETURNING *`,
    [serviceId, txn.id, amountService, amountFee, amountTotal, paymentMethod]
  );

  await pool.query(
    `UPDATE services SET payment_id = $1, status = 'scheduled', updated_at = NOW() WHERE id = $2`,
    [pay[0].id, serviceId]
  );

  return { payment: pay[0], transaction: txn };
}

async function getPayment(serviceId, userId) {
  const { rows } = await pool.query(
    `SELECT p.* FROM payments p
     JOIN services s ON s.id = p.service_id
     WHERE p.service_id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
    [serviceId, userId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Pagamento não encontrado'), { status: 404 });
  return rows[0];
}

async function handleWebhook(rawBody, signature) {
  if (!pagarme.validateWebhookSignature(rawBody, signature)) {
    throw Object.assign(new Error('Assinatura inválida'), { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const txnId = event.data?.id;
  if (!txnId) return;

  const { rows: pay } = await pool.query(
    `SELECT * FROM payments WHERE pagarme_transaction_id = $1`,
    [txnId]
  );
  if (pay.length === 0) return;

  const eventType = event.type;
  if (eventType === 'charge.paid' || eventType === 'order.paid') {
    await pool.query(
      `UPDATE payments SET status = 'held', held_at = NOW() WHERE id = $1`,
      [pay[0].id]
    );
  } else if (eventType === 'charge.refunded') {
    await pool.query(
      `UPDATE payments SET status = 'refunded' WHERE id = $1`,
      [pay[0].id]
    );
  }
}

module.exports = { initiatePayment, getPayment, handleWebhook };
