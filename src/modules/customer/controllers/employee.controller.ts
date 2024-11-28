import { Controller, Get, Query } from '@nestjs/common';
import { ICustomersFilter } from '../dtos/inputs/customers-filter-input.dto';
import { CustomerMapper } from '../dtos/mappers/customer.mapper';
import { EmployeeService } from '../services/employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('/all')
  async getCustomers(@Query() filter?: ICustomersFilter) {
    const result = await this.employeeService.getAll(filter);

    return {
      data: CustomerMapper.displayAll(result),
    };
  }
}
