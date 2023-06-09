import { SerializeableClass, DbSerializeableClass } from "./serializer";

export default function findClass(className: string, serializables: readonly (SerializeableClass | DbSerializeableClass)[],) {
  return serializables.find(
    (serializeable) => ('className' in serializeable
    ? serializeable.className === className
    : serializeable.name === className)
  );
}
