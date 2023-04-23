import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentService {
  async chargeEWallet(externalId: string, amount: number, phoneNumber: string) {
    try {
      const XENDIT_API_KEY =
        'xnd_development_vZmXlXWOgFVZ5M37j08CnrNxQNGZgDtctIfIrL2SKlKbHEev2kAAO0QDEK7qx';
      // 'xnd_development_WyL74KsUF8XmmWDt6Q3NCERvoZxdAkfYA6GGA3U8vmlEunxofJexHQ7VzfkeK45E';
      // Create a payment request
      const createPaymentRequest = {
        reference_id: externalId,
        amount: amount,
        channel_code: 'PH_GCASH',
        checkout_method: 'ONE_TIME_PAYMENT',
        currency: 'PHP',
        channel_properties: {
          mobile_number: phoneNumber,
          cashtag: `$${parseFloat(String(amount))}`,
          success_redirect_url: 'http://localhost:3000/cart?payment=success',
          failure_redirect_url: 'http://localhost:3000/fail?payment=failed',
        },
      };

      const createPaymentResponse = await axios.post(
        'https://api.xendit.co/ewallets/charges',
        createPaymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${XENDIT_API_KEY}:`)}`,
          },
        },
      );

      return createPaymentResponse.data.actions;
    } catch (error) {
      console.error(error.response.data);
      throw new Error('Failed to charge GCash e-wallet');
    }
  }
}
