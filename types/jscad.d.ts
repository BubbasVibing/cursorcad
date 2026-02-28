declare module "@jscad/stl-serializer" {
  interface SerializeOptions {
    binary?: boolean;
  }
  function serialize(options: SerializeOptions, ...geometries: unknown[]): ArrayBuffer[];
  export default { serialize };
}

declare module "@jscad/3mf-serializer" {
  interface SerializeOptions {
    binary?: boolean;
  }
  function serialize(options: SerializeOptions, ...geometries: unknown[]): ArrayBuffer[];
  export default { serialize };
}
