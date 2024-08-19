import { IFilterInput } from 'src/data/dto/filter-input.dto';

export class ICustomersFilter extends IFilterInput {
  isRider?: boolean;
  role?: string;
}
