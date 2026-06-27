const { pool } = require('../config/database');
const pagarmeService = require('../services/pagarme.service');
const notificationService = require('../services/notification.service');
const crypto = require('crypto');

async function initiatePayment(req, res) {
  try {
    const { service_id, method } = req.body;
    if (!service_id || !method) {
      return res.status(400).json({ success: false, error: 'service_id e method são obrigatórios' });
    }

    const validMethods = ['credit_once', 'credit_2x', 'debit', 'pix'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, error: `Método inválido. Use: ${validMethods.join(', ')}` });
    }

    // Get service
    const { rows: svcRows } = await pool.query(
      `SELECT * FROM services WHERE id = $1`,
      [service_id]
    );
    if (svcRows.length === 0) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
    const service = svcRows[0];

    if (service.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o solicitante pode iniciar o pagamento' });
    }
    if (service.status !== 'accepted') {
      return res.status(400).json({ success: false, error: `Pagamento só é possível quando o serviço está aceito. Status atual: ${service.status}` });
    }

    const amountService = parseFloat(service.agreed_price || service.suggested_price || 0);
    if (amountService <= 0) {
      return res.status(400).json({ success: false, error: 'Serviço não possui preço definido' });
    }
    const amountFee = parseFloat((amountService * 0.10).toFixed(2));
    const amountTotal = parseFloat((amountService + amountFee).toFixed(2));

    const transaction = await pagarmeService.createTransaction({
      serviceId: service_id,
      amount: amountTotal,
      paymentMethod: method,
    });

    const { rows } = await pool.query(
      `INSERT INTO payments (service_id, pagarme_transaction_id, amount_service, amount_fee, amount_total, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [service_id, transaction.id, amountService, amountFee, amountTotal, method]
    );
    const payment = rows[0];

    // Link payment to service
    await pool.query(`UPDATE services SET payment_id = $1 WHERE id = $2`, [payment.id, service_id]);

    return res.status(201).json({
      success: true,
      data: {
        payment,
        transaction: {
          id: transaction.id,
          status: transaction.status,
          pix_qr_code: transaction.pix_qr_code || null,
          pix_expiration_date: transaction.pix_expiration_date || null,
        },
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function webhook(req, res) {
  try {
    const signature = req.headers['x-hub-signature'] || req.headers['x-pagarme-signature'] || '';
    const secret = process.env.PAGARME_WEBHOOK_SECRET;

    // Validate HMAC signature (skip in dev if no secret configured)
    if (secret) {
      const rawBody = JSON.stringify(req.body);
      const expected = 'sha1=' + crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
      if (signature !== expected) {
        return res.status(401).json({ success: false, error: 'Assinatura inválida' });
      }
    }

    const { type, data } = req.body;

    if (type === 'transaction.paid' || (data && data.status === 'paid')) {
      const transactionId = data?.id;
      if (!transactionId) return res.json({ success: true });

      const { rows: payRows } = await pool.query(
        `SELECT * FROM payments WHERE pagarme_transaction_id = $1`,
        [transactionId]
      );
      if (payRows.length === 0) return res.json({ success: true });
      const payment = payRows[0];

      await pool.query(
        `UPDATE payments SET status = 'held', held_at = NOW() WHERE id = $1`,
        [payment.id]
      );
      await pool.query(
        `UPDATE services SET status = 'scheduled', updated_at = NOW() WHERE id = $1`,
        [payment.service_id]
      );

      // Notify provider
      const { rows: svcRows } = await pool.query(`SELECT * FROM services WHERE id = $1`, [payment.service_id]);
      if (svcRows.length > 0) {
        await notificationService.sendPush(
          svcRows[0].provider_id,
          'Pagamento confirmado!',
          'O pagamento foi confirmado. Você pode iniciar o serviço.',
          { service_id: payment.service_id }
        );
      }
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getPayment(req, res) {
  try {
    const { service_id } = req.params;

    // Verify access
    const { rows: svcRows } = await pool.query(`SELECT * FROM services WHERE id = $1`, [service_id]);
    if (svcRows.length === 0) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
    const service = svcRows[0];
    if (service.requester_id !== req.user.id && service.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    const { rows } = await pool.query(`SELECT * FROM payments WHERE service_id = $1`, [service_id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { initiatePayment, webhook, getPayment };
