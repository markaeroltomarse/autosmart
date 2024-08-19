export const setObjectDefaultValue = <T extends object, U extends object>(
  payload: T,
  defaultObject: U,
): U & T => {
  return {
    ...defaultObject,
    ...payload,
  };
};
