import { FindCircularReferences } from './findCircularReferences';

export type PathInto<T> = T extends FindCircularReferences<T>
  ? any
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends 'classes'
        ? never
        : `${K & string}` | `${K & string}.${PathInto<T[K]>}`;
    }[keyof T]
  : never;

export type GetTypeFromPath<T, Path extends string> = Path extends ''
  ? T
  : GTFP<T, Path>;

type GTFP<T, Path extends string> = Path extends keyof T
  ? T[Path]
  : Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? GTFP<T[Key], Rest>
    : never
  : never;
