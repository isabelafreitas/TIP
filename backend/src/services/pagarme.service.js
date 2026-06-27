/**
 * Pagar.me payment service.
 * In development/test mode all calls are stubbed and return mock data.
 * In production, replace stub blocks with real Pagar.me REST v5 calls.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';
const FEE_PERCENT = parseFloat(process.env.TIP_FEE_PERCENT || '15') / 100;

/**
 * Calculate fee amounts for a given service price.
 */
function calculateAmounts(agreedPrice) {
  const amountService = parseFloat(agreedPrice);
  const amountFee = parseFloat((amountService * FEE_PERCENT).toFixed(2));
  const amountTotal = parseFloat((amountService + amountFee).toFixed(2));
  return { amountService, amountFee, amountTotal };
}

/**
 * Create an escrow transaction via Pagar.me.
 * @param {object} params
 * @param {string} params.serviceId
 * @param {number} params.amount - total amount in BRL
 * @param {string} params.paymentMethod - credit_once | credit_2x | debit | pix
 * @param {object} params.cardData - { number, holderName, expiryMonth, expiryYear, cvv } (omit for pix)
 * @returns {object} transaction result
 */
async function createTransaction({ serviceId, amount, paymentMethod, cardData }) {
  if (IS_DEV) {
    console.log(`[PAGARME STUB] createTransaction serviceId=${serviceId} amount=${amount} method=${paymentMethod}`);
    return {
      id: `stub_txn_${Date.now()}`,
      status: 'waiting_payment',
      payment_method: paymentMethod,
      amount,
      pix_qr_code: paymentMethod === 'pix' ? 'stub_pix_qr_code_data' : null,
      pix_expiration_date: paymentMethod === 'pix' ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
      boleto_url: null,
    };
  }

  // Production: real Pagar.me API v5
  const https = require('https');
  const apiKey = process.env.PAGARME_API_KEY;
  const body = JSON.stringify({
    items: [{ amount: Math.round(amount * 100), description: `TIP Service ${serviceId}`, quantity: 1 }],
    payments: [buildPaymentObject(paymentMethod, Math.round(amount * 100), cardData)],
    metadata: { service_id: serviceId },
  });

  return await pagarmePost('/orders', body, apiKey);
}

function buildPaymentObject(method, amountCents, cardData) {
  if (method === 'pix') {
    return { payment_method: 'pix', pix: { expires_in: 1800 } };
  }
  const installments = method === 'credit_2x' ? 2 : 1;
  return {
    payment_method: 'credit_card',
    credit_card: {
      installments,
      statement_descriptor: 'TIP MARKETPLACE',
      card: {
        number: cardData.number,
        holder_name: cardData.holderName,
        exp_month: cardData.expiryMonth,
        exp_year: cardData.expiryYear,
        cvv: cardData.cvv,
      },
    },
    amount: amountCents,
  };
}

/**
 * Release held payment to provider (minus TIP fee).
 * @param {string} transactionId - Pagar.me transaction id
 * @param {number} providerAmount - amount to release to provider in BRL
 */
async function releasePayment(transactionId, providerAmount) {
  if (IS_DEV) {
    console.log(`[PAGARME STUB] releasePayment txn=${transactionId} amount=${providerAmount}`);
    return { id: transactionId, status: 'paid', released_amount: providerAmount };
  }

  const apiKey = process.env.PAGARME_API_KEY;
  const recipientId = process.env.PAGARME_RECIPIENT_ID;
  const body = JSON.stringify({
    amount: Math.round(providerAmount * 100),
    recipient_id: recipientId,
  });
  return await pagarmePost(`/transfers`, body, apiKey);
}

/**
 * Refund a transaction fully or partially.
 * @param {string} transactionId - Pagar.me transaction id
 * @param {number|null} amount - amount in BRL to refund; null = full refund
 */
async function refundPayment(transactionId, amount = null) {
  if (IS_DEV) {
    console.log(`[PAGARME STUB] refundPayment txn=${transactionId} amount=${amount ?? 'full'}`);
    return { id: transactionId, status: 'refunded', refunded_amount: amount };
  }

  const apiKey = process.env.PAGARME_API_KEY;
  const body = amount ? JSON.stringify({ amount: Math.round(amount * 100) }) : '{}';
  return await pagarmePost(`/charges/${transactionId}/refund`, body, apiKey);
}

/**
 * Validate Pagar.me webhook HMAC signature.
 */
function validateWebhookSignature(rawBody, signatureHeader) {
  if (IS_DEV) return true;
  const crypto = require('crypto');
  const secret = process.env.PAGARME_HMAC_SECRET;
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return hmac === signatureHeader;
}

// ---- helpers ----

function pagarmePost(path, body, apiKey) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const options = {
      hostname: 'api.pagar.me',
      port: 443,
      path: `/core/v5${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) return reject(new Error(`Pagar.me error ${res.statusCode}: ${data}`));
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { createTransaction, releasePayment, refundPayment, validateWebhookSignature, calculateAmounts };
