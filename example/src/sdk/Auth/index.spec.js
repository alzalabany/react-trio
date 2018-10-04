import Auth from "./index";

it("Auth module export required components", () => {
  expect(typeof Auth.reducer).toBe("function");

  expect(Array.isArray(Auth.actions)).toBeTruthy();

  expect(Auth.types).toBeTruthy();
  expect(typeof Auth.types.leaf).toBe("string");

  expect(Auth.selectors).toBeDefined();
});

