import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { AdminLoginInput } from './../dto/input/login-admin.input';
import { AdminMapper } from './../dto/mapper/admin.mapper';
import { AdminService } from '@modules/admin/services/admin.service';
import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreateAdminInput } from '../dto/input/create-admin.input';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { ISummaryOutputDto } from '../dto/output/dashboard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly predictiveAnalyticsService: PredictiveAnalyticsService,
  ) {}

  @Get()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async getAdmin(@CurrentUser('id') adminId: string) {
    const result = await this.adminService.getAdmin(adminId);

    return {
      data: AdminMapper.displayOne(result),
    };
  }

  // Create Admin
  @Post()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async createAdmin(@Body() adminInput: CreateAdminInput) {
    const result = await this.adminService.createAdmin(adminInput);
    return {
      data: AdminMapper.displayOne(result),
    };
  }

  // Create Admin
  @Post('login')
  @GenericResponse()
  async loginAdmin(@Body() loginInput: AdminLoginInput) {
    const result = await this.adminService.loginAdmin(loginInput);
    return {
      data: {
        ...result,
        admin: AdminMapper.displayOne(result.admin),
      },
    };
  }

  @Get('/sales-prediction')
  @GenericResponse()
  async dashboard() {
    const result = await this.predictiveAnalyticsService.getSalesPrediction();
    return {
      data: result,
    };
  }

  @Get('/inventory-prediction')
  @GenericResponse()
  async getInventoryPrediction() {
    return {
      data: await this.predictiveAnalyticsService.getInventoryPrediction(),
    };
  }

  @Get('/summary')
  async getSummary(): Promise<ISummaryOutputDto> {
    return this.predictiveAnalyticsService.getSummary();
  }
}
