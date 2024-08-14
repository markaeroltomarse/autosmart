import { FE_URL } from '@common/environment';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async chargeEWallet(
    toBeserialNumber: string,
    amount: number,
    phoneNumber: string,
    customerId: string,
  ) {
    const customer = await this.prismaService.customerEntity.findUnique({
      where: { id: customerId },
      select: {
        isVerified: true,
      },
    });

    if (!customer?.isVerified) {
      throw new ForbiddenException('Account not verified.');
    }

    try {
      const XENDIT_API_KEY =
        'xnd_development_vZmXlXWOgFVZ5M37j08CnrNxQNGZgDtctIfIrL2SKlKbHEev2kAAO0QDEK7qx';
      // 'xnd_development_WyL74KsUF8XmmWDt6Q3NCERvoZxdAkfYA6GGA3U8vmlEunxofJexHQ7VzfkeK45E';
      // Create a payment request
      const createPaymentRequest = {
        reference_id: toBeserialNumber,
        amount: amount,
        channel_code: 'PH_GCASH',
        checkout_method: 'ONE_TIME_PAYMENT',
        currency: 'PHP',
        channel_properties: {
          mobile_number: phoneNumber,
          cashtag: `$${customerId.slice(0, 13)}`,
          success_redirect_url: `${FE_URL}/cart?payment=success`,
          failure_redirect_url: `${FE_URL}/fail?payment=failed`,
        },
      };

      const createPaymentResponse = await axios.post(
        'https://api.xendit.co/ewallets/charges',
        createPaymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Basic ${btoa(`${XENDIT_API_KEY}:`)}`,
            Authorization: `Basic ${Buffer.from(`${XENDIT_API_KEY}:`, 'utf8').toString('base64')}`,
          },
        },
      );

      return createPaymentResponse.data.actions;
    } catch (error) {
      console.log(error)
      console.log(error.response?.data || error?.response);
      throw new BadRequestException('Failed to charge GCash e-wallet');
    }
  }
}
