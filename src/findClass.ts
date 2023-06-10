

export default function findClass(className: string, serializables: readonly ({ className?: string, name: string })[],) {
  return serializables.find(
    (serializeable) => (serializeable.className
      ? serializeable.className === className
      : serializeable.name === className)
  );
}
