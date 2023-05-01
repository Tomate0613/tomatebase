import { Contains } from './contains';

export type FindCircularReferences<T, K extends any[] = []> = Contains<
  T,
  K
> extends true
  ? T
  : T extends Record<string, any>
  ? {
      [P in keyof T]: FindCircularReferences<T[P], [...K, T]>; // Recursive call with the object as the second argument
    }[keyof T]
  : never;
