import { ProductService } from './../../product/services/product.service';
import { AddToCartInput } from './../dtos/inputs/add-to-cart.input';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ICheckoutCartProduct } from '../dtos/interfaces/cart-product.interface';
import { CheckOutInput } from '../dtos/inputs/checkout.input';
import { Prisma } from '@prisma/client';
import { ICartItemJson } from 'src/data/types/cart.types';

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
      const cartProducts = cart.products as unknown as ICartItemJson[];

      // Check if incoming item is already in the cart
      const isExist = cartProducts.some(
        (item) =>
          item.productId === product.id &&
          // Check the product property
          item.application === addToCartInput.application &&
          item.color === addToCartInput.color,
      );

      if (isExist) {
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
                    id: Math.random()
                      .toString(16)
                      .slice(2, 2 + 16),
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

  async removeCartItems(
    customerId: string,
    cartId: string,
    productCartRecordIds: string[],
  ): Promise<any | null> {
    // Fetch the cart by id and customerId
    const cart = await this.prismaService.cartEntity.findFirst({
      where: {
        id: cartId,
        customerId: customerId,
      },
    });

    // Check if cart exists
    if (!cart) {
      return null;
    }

    // Filter out products that should be removed
    const updatedProducts = cart.products.filter(
      (product: any) => !productCartRecordIds.includes(product.id),
    );

    // Update the cart with the filtered products
    return this.prismaService.cartEntity.update({
      where: {
        id: cartId,
      },
      data: {
        products: {
          set: updatedProducts,
        },
      },
    });
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

    if (!cart.products.some((item: any) => item.id === cartItemInput.id)) {
      throw new NotFoundException(
        'Product not found in your cart, Please try again.',
      );
    }

    const product = await this.productService.getProduct(
      cartItemInput.productId,
    );
    if (cartItemInput.quantity > product.quantity) {
      throw new BadRequestException('Not enough quantity, Please try again.');
    }

    // Update cart item quantity
    let cartProducts = cart.products as unknown as ICartItemJson[];
    if (cartItemInput.quantity <= 0) {
      cartProducts = cartProducts.filter(
        (item) => item.id !== cartItemInput.id,
      );
    } else {
      cartProducts.forEach((item) => {
        if (item.id === cartItemInput.id) {
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
      const item = cartItem as unknown as ICartItemJson;
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

    const productRecordIds: string[] = checkOutInput.products.map(
      (item) => item.id,
    );

    const productIds: string[] = checkOutInput.products.map(
      (item) => item.productId,
    );

    const products = await Promise.all(
      productIds.map((productId: string) =>
        this.prismaService.productEntity.findUnique({
          where: {
            id: productId,
          },
        }),
      ),
    );

    // const products = await this.prismaService.productEntity.findMany({
    //   where: {
    //     id: {
    //       in: productRecordIds,
    //     },
    //   },
    // });

    if (checkOutInput.products.length === 0 || products.length === 0) {
      throw new BadRequestException('Products should not be empty array.');
    }

    // Validate the Selected Product before check out
    let totalAmount: number = 0;
    let productsTobeRemoveInCart = [];
    let productToBeUpdate = [];

    let productQuantityTracker = Object.values(
      products.reduce((acc, product) => {
        if (!acc[product.id]) {
          acc[product.id] = { productId: product.id, quantity: 0 };
        }
        acc[product.id].quantity += product.quantity;
        return acc;
      }, {} as { [key: number]: { productId: string; quantity: number } }),
    );

    for (const actualProduct of products) {
      const cartItem: ICartItemJson = cart.products.find(
        (item: any) => item.productId === actualProduct.id,
      );

      // if (selectedItem.quantity > actualProduct.quantity) {
      //   throw new BadRequestException(
      //     `${actualProduct.name} exceeded quantity, Please try again.`,
      //   );
      // }

      // if (selectedItem.quantity > cartItem.quantity) {
      //   throw new BadRequestException(
      //     `the quantity of ${actualProduct.name} in your cart should less than equal to your choosen quantity for this product.`,
      //   );
      // }

      // Get total amount
      totalAmount +=
        (actualProduct.price - actualProduct.discount) * cartItem.quantity;

      // Update product quantity
      const productQuantitySumIndex = productQuantityTracker.findIndex(
        (product) => product.productId === actualProduct.id,
      );
      const quantityLeft =
        productQuantityTracker[productQuantitySumIndex].quantity -
        cartItem.quantity;

      if (quantityLeft >= 0) {
        if (cartItem.quantity === cartItem.quantity) {
          productsTobeRemoveInCart.push(actualProduct.id);
        }

        productToBeUpdate.push({
          ...cartItem,
          finalQuantity: quantityLeft,
        });

        // Update the quantity left
        productQuantityTracker[productQuantitySumIndex].quantity = quantityLeft;
      } else {
        throw new BadRequestException(
          `${actualProduct.name} - ${cartItem.application} - ${cartItem.color} is not enough quantity.`,
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
        (item) => item.id === toBeCheckOut.id,
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
      (item: any) => !productsTobeRemoveInCart.includes(item.id),
    );

    cartProducts.forEach((item: ICartItemJson) => {
      const selectedItem = checkOutInput.products.find(
        (selected) => selected.id === item.id,
      );

      if (selectedItem) {
        item.quantity -= selectedItem.quantity;
      }
    });

    cartProducts = cartProducts.filter((item) => item.quantity > 0);

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
