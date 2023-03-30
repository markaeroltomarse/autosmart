import { CustomerEntity } from '@prisma/client';

export class CustomerMapper {
  static displayOne(customer: CustomerEntity) {
    if (!customer) return null;
    delete customer['password'];

    return customer;
  }
}
