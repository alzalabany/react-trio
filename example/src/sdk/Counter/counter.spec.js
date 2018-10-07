import Counter from "./index";

describe("Counter Module", () => {
  const [countAction] = Counter.actions;
  const { ADD, SUBTRACT } = Counter.types;
  const Reducer = Counter.reducer;

  it("Counter module export required components", () => {
    expect(typeof Counter.reducer).toBe("function");

    expect(Array.isArray(Counter.actions)).toBeTruthy();

    expect(Counter.types).toBeTruthy();
    expect(typeof Counter.types.leaf).toBe("string");

    expect(Counter.selectors).toBeDefined();
  });

  describe("Reducer", () => {
    it("Reducer module export required components", () => {
      expect(Reducer(undefined, { type: "X" })).toBe(Reducer.initialState);

      // if corrupted state for somereason
      expect(Reducer(null, { type: "X" })).toBe(Reducer.initialState);
      expect(Reducer(false, { type: "X" })).toBe(Reducer.initialState);

      expect(Reducer(0, { type: "X" })).toBe(0);
      expect(Reducer(-1, { type: "X" })).toBe(-1);
      expect(Reducer(-1, { type: "X", value: 1 })).toBe(0);
    });

    it("typeless reducer, protected by eventName", () => {
      expect(Reducer(-1, { value: 1 })).toBe(0);
      expect(Reducer(-1, { value: -1 })).toBe(-2);
    });
  });

  describe("Actions", () => {
    it("can create an Add action", async () => {
      expect(await countAction(ADD, 2, null, () => 1)).toEqual({
        type: ADD,
        value: 2
      });
    });

    it("can create an Subtract action", async () => {
      expect(await countAction(SUBTRACT, 2, null, () => 1)).toEqual({
        type: ADD,
        value: -2
      });
    });

    it("integrate well with reducer implementation", async () => {
      expect(Reducer(0, await countAction(ADD, 2, null, () => 1))).toBe(2);
      expect(Reducer(0, await countAction(SUBTRACT, 2, null, () => 1))).toBe(
        -2
      );
    });
  });

  describe("Selectors & integration", () => {
    let rootReducer, state;
    const { combineReducers } = require("../../../../src/utils");
    beforeEach(() => {
      rootReducer = combineReducers({
        [Counter.types.leaf]: Counter.reducer
        // spy: (state, action) => (console.log("'i'm a spy", state, action), 1)
      });

      /**
       * @@FIXED:BUG #1.0.*./1 | fn -> combineReducer | file: utlis
       * @@todo fix :TypeError: Cannot read property 'counter' of null
       * example:
       * const state = r(null, { type: Counter.types.ADD, value: 5 });
       */
      state = rootReducer(null, { type: combineReducers.type });

      // combineReducer returned expected AppState
      expect(state).toEqual({ [Counter.types.leaf]: Reducer.initialState });
    });

    it("select domain", async () => {
      expect(Counter.selectors.domain(state)).toEqual(Reducer.initialState); // selector did good job
    });

    it("select domain with actions through rootReducer e2e", async () => {
      let anotherState = rootReducer(
        state,
        await countAction(ADD, 2, null, () => state)
      );
      expect(Counter.selectors.domain(anotherState)).toBe(2); // selector did good job

      anotherState = rootReducer(
        state,
        await countAction(SUBTRACT, 4, null, () => state)
      );
      expect(Counter.selectors.domain(anotherState)).toBe(-4); // selector did good job
    });
  });
});
