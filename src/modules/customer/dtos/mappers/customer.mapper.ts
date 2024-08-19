import { CustomerEntity } from '@prisma/client';
import { ICustomerOutput } from '../outputs/customer.output';

export class CustomerMapper {
  static displayOne(customer: CustomerEntity) {
    if (!customer) return null;
    delete customer['password'];

    return customer;
  }

  static displayAll(customers: CustomerEntity[]): ICustomerOutput[] {
    return customers.map((customer) => this.displayOne(customer));
  }
}
