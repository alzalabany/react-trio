import Power from "./index";

it("Power module export required components", () => {
  expect(typeof Power.reducer).toBe("function");

  expect(Array.isArray(Power.actions)).toBeTruthy();

  expect(Power.types).toBeTruthy();
  expect(typeof Power.types.leaf).toBe("string");

  expect(Power.selectors).toBeDefined();
});

