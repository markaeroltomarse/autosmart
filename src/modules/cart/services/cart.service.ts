import { ProductService } from './../../product/services/product.service';
import { AddToCartInput } from './../dtos/inputs/add-to-cart.input';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ICartProduct } from '../dtos/interfaces/cart-product.interface';
import { CheckOutInput } from '../dtos/inputs/checkout.input';
import { CartEntity, CustomerEntity, Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async addToCartItem(customerId: string, addToCartInput: AddToCartInput) {
    const cart = await this.prismaService.cartEntity.findFirst({
      where: {
        customerId: customerId,
      },
    });

    const product = await this.productService.getProduct(
      addToCartInput.productId,
    );

    if (addToCartInput.quantity > product.quantity) {
      throw new BadRequestException(
        'Not enough product quantity, Please try again.',
      );
    }

    if (cart) {
      // If user is already have cart record
      const cartProducts = cart.products as unknown as ICartProduct[];

      // Check if incoming item is already in the cart
      if (
        cartProducts.some((item) => item.productId === addToCartInput.productId)
      ) {
        return this.getCart(customerId);
      } else {
        // Add the product into cart
        await this.prismaService.cartEntity
          .update({
            where: {
              id: cart.id,
            },
            data: {
              products: {
                push: [
                  {
                    ...addToCartInput,
                  },
                ],
              },
            },
          })
          .catch((error) => {
            console.log(error);
            throw new BadRequestException(
              'Cannot add item to cart, Please try again.',
            );
          });
      }
    } else {
      // Create user cart record included his new product
      await this.prismaService.cartEntity
        .create({
          data: {
            customerId,
            products: [{ ...addToCartInput }],
          },
        })
        .catch((error) => {
          console.log(error);
          throw new BadRequestException(
            'Cannot add to cart, Please try again.',
          );
        });
    }

    return this.getCart(customerId);
  }

  async updateQuantity(customerId: string, cartItemInput: AddToCartInput) {
    const cart = await this.prismaService.cartEntity
      .findFirst({
        where: {
          customerId: customerId,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get cart, Please try again.');
      });

    if (
      !cart.products.some(
        (item: any) => item.productId === cartItemInput.productId,
      )
    ) {
      throw new NotFoundException(
        'Product not found in your cart, Please try again.',
      );
    }

    const product = await this.productService.getProduct(
      cartItemInput.productId,
    );
    if (cartItemInput.quantity > product.quantity) {
      throw new BadRequestException('Not enought quantity, Please try again.');
    }

    // Update cart item quantity
    let cartProducts = cart.products as unknown as ICartProduct[];
    if (cartItemInput.quantity <= 0) {
      cartProducts = cartProducts.filter(
        (item) => item.productId !== cartItemInput.productId,
      );
    } else {
      cartProducts.forEach((item) => {
        if (item.productId === cartItemInput.productId) {
          item.quantity = cartItemInput.quantity;
        }
      });
    }

    await this.prismaService.cartEntity.update({
      where: {
        id: cart.id,
      },
      data: {
        products: cartProducts as any[],
      },
    });

    return this.getCart(customerId);
  }

  async clearCartItems(customerId: string) {
    const cart = await this.prismaService.cartEntity.findFirst({
      where: {
        customerId,
      },
    });

    if (!cart) throw new NotFoundException('Cart not found, Please try again.');

    return this.prismaService.cartEntity.update({
      where: {
        id: cart.id,
      },
      data: {
        products: [],
      },
    });
  }

  async getCart(customerId: string) {
    const cart = await this.prismaService.cartEntity
      .findFirst({
        where: {
          customerId: customerId,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get cart, Please try again.');
      });
    const products = [];
    for (let cartItem of cart.products) {
      const item = cartItem as unknown as ICartProduct;
      products.push({
        ...item,
        product: await this.productService.getProduct(item.productId),
      });
    }

    return {
      ...cart,
      products,
    };
  }

  async checkOut(customerId: string, checkOutInput: CheckOutInput) {
    interface CartWithCustomer extends CartEntity {
      customer: CustomerEntity;
    }
    if (checkOutInput.products.length === 0) {
      throw new BadRequestException('Products should not be empty array.');
    }

    const cart: any = await this.prismaService.cartEntity.findFirst({
      include: {
        customer: true,
      },
      where: {
        customerId: customerId,
      },
    } as Prisma.CartEntityFindFirstArgs);

    if (!cart) {
      throw new NotFoundException('Cart not found, Please try again.');
    }

    if (cart.products.length === 0) {
      throw new NotFoundException(
        'Product not found in your cart, Please try again.',
      );
    }

    if (cart.customer.defaultAddress === '') {
      throw new NotFoundException(
        'Please select an address for your order, Please try again.',
      );
    }

    const productIds: string[] = checkOutInput.products.map(
      (item) => item.productId,
    );

    const products = await this.prismaService.productEntity.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (checkOutInput.products.length === 0 || products.length === 0) {
      throw new BadRequestException('Products should not be empty array.');
    }

    // Validate the Selected Product before check out
    let totalAmount: number = 0;
    let productsTobeRemoveInCart = [];
    let productToBeUpdate = [];
    for (const product of products) {
      const selectedItem = checkOutInput.products.find(
        (item) => item.productId === product.id,
      );

      const cartItem: any = cart.products.find(
        (item: any) => item.productId === selectedItem.productId,
      );

      if (!selectedItem || !cartItem) {
        throw new NotFoundException(
          `${product.name} is not added to your cart. Please try again.`,
        );
      }

      if (selectedItem.quantity > product.quantity) {
        throw new BadRequestException(
          `${product.name} exceeded quantity, Please try again.`,
        );
      }

      if (selectedItem.quantity > cartItem.quantity) {
        throw new BadRequestException(
          `the quantity of ${product.name} in your cart should less than equal to your choosen quantity for this product.`,
        );
      }

      // Get total amount
      totalAmount += product.price * selectedItem.quantity;

      // Update product quantity
      const quantityLeft = product.quantity - selectedItem.quantity;

      if (quantityLeft >= 0) {
        if (selectedItem.quantity === cartItem.quantity) {
          productsTobeRemoveInCart.push(product.id);
        }

        productToBeUpdate.push({
          ...selectedItem,
          finalQuantity: quantityLeft,
        });
      } else {
        throw new BadRequestException(
          `${product.name} is not enough quantity.`,
        );
      }
    }

    // Update the products
    for (const selectedProduct of productToBeUpdate) {
      await this.productService.updateProduct(selectedProduct.productId, {
        quantity: selectedProduct.finalQuantity,
      });
    }

    let toBeCheckOuts = [];
    for (const toBeCheckOut of checkOutInput.products) {
      const cartItem = cart.products.find(
        (item) => item.productId === toBeCheckOut.productId,
      );

      toBeCheckOuts.push({
        ...cartItem,
        quantity: toBeCheckOut.quantity,
      });
    }

    // Save to transaction DB
    await this.prismaService.transactionEntity.create({
      data: {
        status: 'pending',
        serialNumber: checkOutInput.serialNumber,
        totalAmount,
        customerId,
        products: [...(toBeCheckOuts as any)],
      },
    });

    // Remove Product Item that 0 Quantity Cart
    let cartProducts = cart.products.filter(
      (item: any) => !productsTobeRemoveInCart.includes(item.productId),
    );

    cartProducts.forEach((item: any) => {
      const selectedItem = checkOutInput.products.find(
        (selected) => selected.productId === item.productId,
      );

      if (selectedItem) {
        item.quantity -= selectedItem.quantity;
      }
    });

    return this.prismaService.cartEntity.update({
      where: {
        id: cart.id,
      },
      data: {
        products: [...(cartProducts as any[])],
      },
    });
  }
}
