import { AdminEntity } from '@prisma/client';

export interface AdminMapperInterface {
  id: string;
  fname: string;
  lname: string;
  email: string;
  //password: string //password should not include. for security
}

export class AdminMapper {
  static displayOne(admin: AdminEntity): AdminMapperInterface {
    // Check if admin is empty and return null to avoid NULL error below.
    if (!admin) return null;

    return {
      id: admin.id,
      email: admin.email,
      fname: admin.fname,
      lname: admin.lname,
    };
  }
}
