export type Contains<T, K extends any[] = []> = K extends [infer H, ...infer R]
  ? T extends H
    ? true
    : Contains<T, R>
  : false;
