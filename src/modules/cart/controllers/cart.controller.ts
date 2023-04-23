import { CheckOutInput } from './../dtos/inputs/checkout.input';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { CartService } from './../services/cart.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AddToCartInput } from '../dtos/inputs/add-to-cart.input';
import { PaymentService } from '../services/payment.service';
import { PaymentInput } from '../dtos/inputs/payment.input';

@Controller('carts')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async getCart(@CurrentUser('id') customerId: string) {
    const result = await this.cartService.getCart(customerId);

    return {
      data: result,
    };
  }

  @Post()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async addToCartItem(
    @CurrentUser('id') customerId: string,
    @Body() addToCartInput: AddToCartInput,
  ) {
    const result = await this.cartService.addToCartItem(
      customerId,
      addToCartInput,
    );

    return {
      data: result,
    };
  }

  @Put()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async updateQuantity(
    @CurrentUser('id') customerId: string,
    @Body() updateCartItem: AddToCartInput,
  ) {
    const result = await this.cartService.updateQuantity(
      customerId,
      updateCartItem,
    );

    return {
      data: result,
    };
  }

  @Delete('')
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async clearCartItems(@CurrentUser('id') customerId: string) {
    const result = await this.cartService.clearCartItems(customerId);

    return {
      data: result,
    };
  }

  @Post('/checkout')
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async checkOut(
    @CurrentUser('id') customerId: string,
    @Body() selectedProductsInput: CheckOutInput,
  ) {
    const result = await this.cartService.checkOut(
      customerId,
      selectedProductsInput,
    );

    return {
      data: result,
    };
  }

  @Post('/payment')
  async chargeGcashEWallet(
    @Body() { amount, externalId, phoneNumber }: PaymentInput,
  ) {
    console.log({ externalId, amount, phoneNumber });
    const data = await this.paymentService.chargeEWallet(
      externalId,
      amount,
      phoneNumber,
    );
    return data;
  }

  @Get('/payment/callback')
  async paymentCallback(@Body() paymentResult: any) {
    return paymentResult;
  }
}
