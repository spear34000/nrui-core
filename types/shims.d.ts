declare module 'assert' {
  function assert(value: unknown, message?: string): asserts value;
  namespace assert {
    function strictEqual(actual: unknown, expected: unknown, message?: string): void;
    function deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
  }
  export = assert;
}
