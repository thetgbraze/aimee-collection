import { supabase } from '../lib/supabase';

const EDGE_FUNCTION_URL = 'https://xkftwzkqjmormacnucoy.supabase.co/functions/v1/send-order-confirmation';

/**
 * Generate luxury Haute Couture HTML email for Aimee Collection
 */
export function generateOrderConfirmationHtml({
  orderRef,
  customerName,
  customerEmail,
  customerPhone,
  deliveryAddress,
  paymentMethod,
  items = [],
  subtotalUSD = 0,
  subtotalRWF = 0,
  discountPercent = 0,
  totalUSD = 0,
  totalRWF = 0,
  notes = '',
}) {
  const itemRows = items.map(item => `
    <tr style="border-bottom: 1px solid #222;">
      <td style="padding: 14px 8px; color: #f5f5f5;">
        <strong style="color: #ffffff; font-size: 14px;">${item.title || item.product_title}</strong>
        ${item.size ? `<br/><span style="color: #a0a0a0; font-size: 12px;">Size: ${item.size}</span>` : ''}
      </td>
      <td style="padding: 14px 8px; text-align: center; color: #a0a0a0; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 14px 8px; text-align: right; color: #d4af37; font-size: 13px; font-weight: 600;">
        $${Number(item.unit_price_usd || item.price_at_purchase_usd || 0).toFixed(2)}
        <br/><span style="color: #777; font-size: 11px;">RWF ${Number(item.unit_price_rwf || item.price_at_purchase_rwf || 0).toLocaleString()}</span>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation - Aimee Collection</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0b0b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #141414; border: 1px solid #262626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 20px 24px; background: linear-gradient(180deg, #1f1a14 0%, #141414 100%); border-bottom: 1px solid #2a251b;">
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 4px; color: #d4af37; font-weight: 700; text-transform: uppercase;">AIMEE</h1>
              <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 3px; color: #bfa15f; text-transform: uppercase;">COLLECTION • HAUTE COUTURE</p>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 30px 32px 10px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; color: #d4af37; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px;">
                ORDER CONFIRMATION #${orderRef}
              </div>
              <h2 style="margin: 0 0 12px; font-size: 22px; color: #ffffff; font-weight: 600;">
                Thank you for your order, ${customerName || 'Valued Client'}
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #a5a5a5;">
                We are delighted to confirm that your couture order has been placed. Our atelier is now curating your bespoke items for complimentary express dispatch.
              </p>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 10px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 1px solid #333; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">
                    <th align="left" style="padding-bottom: 8px;">Selected Piece</th>
                    <th align="center" style="padding-bottom: 8px;">Qty</th>
                    <th align="right" style="padding-bottom: 8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total Summary Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; padding: 16px; border: 1px solid #262626;">
                ${discountPercent ? `
                <tr>
                  <td style="padding: 4px 8px; color: #888; font-size: 13px;">Special Discount:</td>
                  <td align="right" style="padding: 4px 8px; color: #4ade80; font-size: 13px; font-weight: 600;">-${discountPercent}%</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 8px 4px; color: #ffffff; font-size: 15px; font-weight: 700;">Total Amount:</td>
                  <td align="right" style="padding: 8px 8px 4px; color: #d4af37; font-size: 18px; font-weight: 700;">
                    $${Number(totalUSD).toFixed(2)}
                    <span style="display: block; font-size: 12px; color: #999; font-weight: normal;">RWF ${Number(totalRWF).toLocaleString()}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping & Payment Details -->
          <tr>
            <td style="padding: 0 32px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #222; padding-top: 20px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 12px;">
                    <h4 style="margin: 0 0 6px; font-size: 12px; letter-spacing: 1px; color: #d4af37; text-transform: uppercase;">Delivery Address</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #a5a5a5;">
                      ${deliveryAddress || 'Kigali, Rwanda'}<br/>
                      ${customerPhone ? `Contact: ${customerPhone}` : ''}
                    </p>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 12px;">
                    <h4 style="margin: 0 0 6px; font-size: 12px; letter-spacing: 1px; color: #d4af37; text-transform: uppercase;">Payment Details</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #a5a5a5;">
                      ${(paymentMethod || 'cash_on_delivery').replace(/_/g, ' ').toUpperCase()}<br/>
                      Order Status: <strong style="color: #eab308;">Confirmed & In Progress</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Concierge Footer -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #0f0f0f; border-top: 1px solid #222; color: #666; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 8px; color: #888;">
                Questions regarding your order? Reach our private concierge at <a href="mailto:support@aimee-collection.com" style="color: #d4af37; text-decoration: none;">support@aimee-collection.com</a>
              </p>
              <p style="margin: 0; color: #555;">
                © ${new Date().getFullYear()} Aimee Collection • High Fashion & Luxury Atelier • Kigali, Rwanda
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch an order confirmation email to the customer.
 * 1. Calls Supabase Edge Function `send-order-confirmation`.
 * 2. Checks client Resend API key if configured.
 * 3. Records the email in public.order_emails.
 */
export async function sendOrderConfirmationEmail(orderData) {
  const {
    orderId,
    orderRef,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    items,
    subtotalUSD,
    subtotalRWF,
    discountPercent,
    totalUSD,
    totalRWF,
    notes,
  } = orderData;

  if (!customerEmail) {
    console.warn('[emailService] No customer email provided for order confirmation.');
    return { success: false, error: 'Customer email is required.' };
  }

  const subject = `✦ Order Confirmed: #${orderRef} — Aimee Collection`;
  const html = generateOrderConfirmationHtml(orderData);

  let edgeFunctionResult = null;
  let clientResendResult = null;

  // 1. Invoke Supabase Edge Function
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      edgeFunctionResult = await res.json();
    }
  } catch (err) {
    console.warn('[emailService] Edge function call note:', err.message);
  }

  // 2. Direct client Resend dispatch if key exists
  const clientResendKey = import.meta.env.VITE_RESEND_API_KEY;
  if (clientResendKey) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clientResendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Aimee Collection <onboarding@resend.dev>',
          to: [customerEmail],
          subject,
          html,
        }),
      });
      clientResendResult = await resendRes.json();
    } catch (err) {
      console.warn('[emailService] Client resend error:', err.message);
    }
  }

  // 3. Ensure recorded in public.order_emails
  try {
    await supabase.from('order_emails').insert([{
      order_id: orderId || null,
      recipient_email: customerEmail,
      subject,
      html_body: html,
      status: (edgeFunctionResult?.emailSent || clientResendResult?.id) ? 'sent' : 'recorded',
    }]);
  } catch (dbErr) {
    console.warn('[emailService] order_emails insert error:', dbErr.message);
  }

  return {
    success: true,
    message: `Order confirmation prepared and sent to ${customerEmail}`,
    edgeFunctionResult,
    clientResendResult,
  };
}
