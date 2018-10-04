import {rootReducer, actions, selectors, /*loadFromDisk, saveToDisk*/ } from "./index";

it("sdk export proper modules to be used by provider", () => {
  expect(typeof SDK.rootReducer).toBe("function");
  expect(Array.isArray(SDK.actions) && SDK.actions.length > 0).toBeTruthy();
  expect(!!SDK.selectors).toBeTruthy();

  // expect(typeof SDK.loadFromDisk).toBe("function");
  // expect(typeof SDK.saveToDisk).toBe("function");
});
