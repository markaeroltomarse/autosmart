import { EmployeeEnum } from '@enums/role.enum';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { filterDefaultValue } from 'src/data/dto/filter-input.dto';
import { setObjectDefaultValue } from 'src/utils/object.util';
import {
  CreateCustomerInput,
  UpdateEmployeeInput,
} from '../dtos/inputs/create-customer.input';
import { ICustomersFilter } from '../dtos/inputs/customers-filter-input.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(f: ICustomersFilter) {
    const { search, page, pageItem, role } = setObjectDefaultValue(
      f,
      filterDefaultValue,
    );

    const customers = await this.prismaService.customerEntity.findMany({
      where: {
        OR: [
          {
            fname: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            lname: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        role: role,
      },
      skip: (page - 1) * pageItem,
      take: pageItem,
    });

    return customers;
  }

  async create(employee?: CreateCustomerInput) {
    const isEmailExist = await this.prismaService.customerEntity.findFirst({
      where: {
        email: employee?.email,
        role: {
          not: EmployeeEnum.CUSTOMER,
        },
      },
      select: {
        id: true,
      },
    });

    if (isEmailExist) {
      throw new BadRequestException(
        'Email already exist in employee record, Please select another email.',
      );
    }

    return this.prismaService.customerEntity.create({
      data: {
        ...employee,
        password: employee?.password || 'autosmart2023',
      },
    });
  }

  async update(id: string, employee?: Partial<UpdateEmployeeInput>) {
    return this.prismaService.customerEntity
      .update({
        where: {
          id: id,
        },
        data: {
          ...employee,
          email: undefined,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot update employee.');
      });
  }

  async delete(employeeId: string) {
    return this.prismaService.customerEntity
      .delete({
        where: {
          id: employeeId,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot delete employee.');
      });
  }
}
