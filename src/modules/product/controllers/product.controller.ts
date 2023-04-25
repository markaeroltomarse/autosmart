import { UpdateProductInput } from './../dto/inputs/update-product.input';
import { ProductInput } from './../dto/inputs/product.input';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { ProductService } from './../services/product.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { CreateCategoryInput } from '../dto/inputs/category/category.input';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @GenericResponse()
  async getProducts(@Query() filter?: any) {
    const result = await this.productService.getProducts(filter);

    return {
      data: result,
    };
  }

  @Get(':productId')
  @GenericResponse()
  async getProduct(@Param('productId') productId: string) {
    const result = await this.productService.getProduct(productId);

    return {
      data: result,
    };
  }

  @Post()
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async createProduct(@Body() productInput: ProductInput) {
    const result = await this.productService.createProduct(productInput);

    return {
      data: result,
    };
  }

  @Put(':productId')
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async updateProduct(
    @Param('productId') productId: string,
    @Body() productInput: UpdateProductInput,
  ) {
    const result = await this.productService.updateProduct(
      productId,
      productInput,
    );

    return {
      data: result,
    };
  }

  @Delete(':productId')
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async deleteProduct(@Param('productId') productId: string) {
    const result = await this.productService.deleteProduct(productId);

    return {
      data: result,
    };
  }

  @Post('/category')
  @GenericResponse()
  async createCategory(@Body() categoryInput: CreateCategoryInput) {
    const result = await this.productService.createCategory(categoryInput);
    return {
      data: result,
    };
  }

  @Get('/category/:productType')
  @GenericResponse()
  async getCategories(@Param('productType') productType: string) {
    const result = await this.productService.getCategories(productType);
    return {
      data: result,
    };
  }

  @Delete('/category/:categoryId')
  @GenericResponse()
  async deleteCategories(@Param('categoryId') categoryId: string) {
    const result = await this.productService.deleteCategory(categoryId);
    return {
      data: result,
    };
  }
}
