import Counter from "./index";

it("Counter module export required components", () => {
  expect(typeof Counter.reducer).toBe("function");

  expect(Array.isArray(Counter.actions)).toBeTruthy();

  expect(Counter.types).toBeTruthy();
  expect(typeof Counter.types.leaf).toBe("string");

  expect(Counter.selectors).toBeDefined();
});

