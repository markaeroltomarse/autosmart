import { TransformResponse } from './../interceptors/transform-response.interceptors';
import { UseInterceptors } from '@nestjs/common';

export function GenericResponse() {
  return UseInterceptors(new TransformResponse());
}
