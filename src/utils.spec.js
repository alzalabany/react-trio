import { combineReducers, subscribe, emit, promiseTimeout } from "./utils";

describe("react trio utils", () => {
  describe("combineReducers(config)", () => {
    it("has convert Object to function", () => {
      const spy = jest.fn();
      const shape = { spy };
      expect(typeof combineReducers(shape) === "function").toBeTruthy();
    });
    it("has call all reducers", () => {
      const spy = jest.fn(() => null);
      const shape = { spy, spy2: spy };
      const reducer = combineReducers(shape);

      expect(spy.mock.calls.length).toBe(0);
      reducer({}, { type: "init" });
      expect(spy.mock.calls.length).toBe(2);
    });
    it("return proper App state", () => {
      const spy = jest.fn(() => 42);
      const shape = { spy, spy2: spy };
      const reducer = combineReducers(shape);
      const appState = reducer({}, { type: "init" });
      expect(appState).toEqual({ spy: 42, spy2: 42 });
    });

    it('cant build initalState on action "/trio/@@init/"', () => {
      const spy = jest.fn(() => 44);
      spy.initialState = 47;
      const action = { type: "/trio/@@init/" };
      const reducer = combineReducers({ spy });
      const appState = reducer({}, action);

      expect(appState).toEqual({ spy: 47 });
    });

    it('can restore initalState on action "/trio/@@init/"', () => {
      const spy = jest.fn(() => 44);
      spy.initialState = 47;
      const action = { type: "/trio/@@init/" };
      const reducer = combineReducers({ spy });
      let appState = { spy: 50 };

      appState = reducer(appState, action);
      expect(appState).toEqual({ spy: 50 });
    });

    describe("respect eventName as filter for reducer", () => {
      const iRunEveryTime = jest.fn(() => 42);
      const iRunIFa = jest.fn(() => 42);
      const shouldNotBeCalled = jest.fn(() => 41);

      iRunEveryTime.eventName = "*";
      iRunIFa.eventName = "a";
      shouldNotBeCalled.eventName = ["b", "c"];

      const shape = {
        iRunIFa,
        iRunEveryTime,
        shouldNotBeCalled
      };
      const initialState = {
        iRunIFa: 1,
        iRunEveryTime: 2,
        shouldNotBeCalled: 4
      };
      const reducer = combineReducers(shape);
      it("ignore if not listed", () => {
        reducer(initialState, { type: "a" });
        expect(shouldNotBeCalled.mock.calls.length).toBe(0);
        expect(iRunIFa.mock.calls.length).toBe(1);
        expect(iRunEveryTime.mock.calls.length).toBe(1);
      });

      it("respond when called if not listed", () => {
        reducer(initialState, { type: "b" });
        expect(shouldNotBeCalled.mock.calls.length).toBe(1);
      });
    });
  });

  describe("subscribe(name, fn, eventStore)", () => {
    it("has subscribe(name, fn, eventStore)", () => {
      expect(typeof subscribe === "function").toBeTruthy();
    });
    it("put name on store", () => {
      const fn = jest.fn();
      const name = "eventA";
      const store = {};
      subscribe(name, fn, store);

      expect(Array.isArray(store[name])).toBeTruthy();
      expect(store[name]).toContain(fn);
    });
    it("can unsubscribe from name", () => {
      const fn = jest.fn();
      const name = "eventA";
      const store = {};
      const un = subscribe(name, fn, store);
      un();
      expect(Array.isArray(store[name])).toBeTruthy();
      expect(store[name]).not.toContain(fn);
    });
  });

  describe("promiseTimeout(delay, promise)", () => {
    it("should resolve if promise took less than 100ms", () => {
      const P = new Promise(r => setTimeout(() => r("success"), 50));
      // return promiseTimeout(100, P);
      return expect(promiseTimeout(100, P)).resolves.toEqual("success");
    });
    it("should reject if promise took more than than 100ms", () => {
      const P = new Promise(r => setTimeout(() => r("success"), 150));
      return expect(promiseTimeout(100, P)).rejects.toEqual(
        "Timed out in 100ms."
      );
    });
  });
});

describe("emit(event, data)", () => {
  class MockEmitter {
    constructor(props) {
      this.setState = x => (this.state = x);
      this.emitter = { "*": [] };
      this.reducer = (n, x) => (x && x.value ? x.value : n);
      this.state = -1;

      if (props) Object.assign(this, props);

      this.emit = emit.bind(this);
      return this;
    }
  }

  it("should run with no errors", async () => {
    const state = 0;
    const spy = jest.fn(x => null);
    const spy2 = jest.fn(x => 45);
    const emitter = { "*": [spy], inital: [spy2] };
    const cmp = new MockEmitter({ state, emitter });
    const result = await cmp.emit("inital", 40);
    expect(result).toEqual({
      ok: true,
      willChange: false,
      actions: [null, 45],
      state: 0
    });

    expect(spy.mock.calls.length).toBe(1); // reducer will not be called;
    expect(spy2.mock.calls.length).toBe(1);
  });

  it("call * and subscribed actionCreators only", async () => {
    const spy = jest.fn();
    const donTCallMe = jest.fn();
    const callMe = jest.fn();
    const emitter = {
      "*": [spy],
      a: [donTCallMe, callMe],
      b: [callMe]
    };
    const cmp = new MockEmitter({ emitter });

    cmp.emit("b");

    expect(spy.mock.calls.length).toBe(1);
    expect(callMe.mock.calls.length).toBe(1);
    expect(donTCallMe.mock.calls.length).toBe(0);

    cmp.emit("a");

    expect(spy.mock.calls.length).toBe(2);
    expect(callMe.mock.calls.length).toBe(2);
    expect(donTCallMe.mock.calls.length).toBe(1);
  });

  it("call reducer if actionCreators return action", async () => {
    const action = { type: "A", value: 55 };
    const spy = jest.fn((a, b) => (b && b.value ? b.value : action)); // hacky to get it to work for both reducer and actionC;
    const emitter = {
      "*": [spy]
    };

    const cmp = new MockEmitter({ emitter, reducer: spy });
    const result = await cmp.emit("doesnot matter, i spy on *");

    expect(result).toEqual({
      ok: true,
      willChange: true,
      actions: [action],
      state: 55
    });

    expect(spy.mock.calls.length).toBe(2); // once for actionC & one for reducer;
  });
});
