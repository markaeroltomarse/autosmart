import { CustomerEntity } from '@prisma/client';

export interface ICustomerOutput extends Partial<CustomerEntity> {}
