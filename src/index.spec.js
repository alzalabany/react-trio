import React from "react";
import ReactDOM from "react-dom";
import { connect, Consumer, Provider } from "./index";

describe("react trio core", () => {
  const div = document.createElement("div");
  beforeEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe("Provider", () => {
    it("renders without crashing", () => {
      ReactDOM.render(<Provider reducer={console.log} />, div);
    });

    it("can call fn child of Consumer", () => {
      const spy = jest.fn(() => null);

      ReactDOM.render(
        <Provider reducer={console.log}>
          <Consumer>{spy}</Consumer>
        </Provider>,
        div
      );

      expect(spy.mock.calls.length).toBe(1); // consumer did trigger spy

      expect(Object.keys(spy.mock.calls[0][0]).sort()).toEqual(
        ["emit", "listen", "selectors", "store"].sort()
      ); // consumer supplied me with an object that has {emit, listen, selectors, store
    });

    it("Proxy selectors to all consummers", () => {
      const spy = jest.fn(() => null);
      const test = {};

      ReactDOM.render(
        <Provider reducer={console.log} selectors={test}>
          <Consumer>{spy}</Consumer>
        </Provider>,
        div
      );
      // selectors injected are exactly same object supplied to provider
      expect(spy.mock.calls[0][0].selectors).toBe(test);
      // expect(spy).toBeCalledWith({ store: null });
    });
  });

  describe("HOC function: connect", () => {
    it("connect and inject stateTo", () => {
      const store = { a: 1 };
      const selectors = { noob: 0 };
      const Demo = jest.fn(props => <div>Hello</div>);
      Demo.stateToProps = jest.fn(store => ({ store, x: 1 }));
      const Connected = connect(Demo);

      ReactDOM.render(
        <Provider reducer={x => x} value={store} selectors={selectors}>
          <Connected />
        </Provider>,
        div
      );

      // expect Demo to be rendered and have object returned by stateToProps to be injected
      expect(Demo).toBeCalled();
      expect(Demo.mock.calls[0][0].store).toBe(store);
      expect(Demo.mock.calls[0][0].x).toBe(1);

      // expect stateToProps be called with store, selectors as argumments

      expect(Demo.stateToProps).toBeCalled();
      expect(Demo.stateToProps).toBeCalledWith(store, selectors);
    });
  });

  // @@todo
  describe("Reducers", () => {
    let spy,
      aC,
      Demo,
      store = { a: 1 };
    beforeEach(() => {
      console.log("------After each--------");
    });
    beforeEach(() => {
      console.log("------Before each--------");
      ReactDOM.unmountComponentAtNode(div);
      spy = jest.fn();
      aC = jest.fn(n => ({ type: "any", value: 1 }));
      Demo = jest.fn(props => (
        <div>
          {String(props.store.a)} {console.log(props)}
        </div>
      ));
      const Connected = connect(Demo);
      ReactDOM.render(
        <Provider
          actions={[aC]}
          value={store}
          reducer={(state, action) =>
            action.value
              ? {
                  a: action.value + state.a
                }
              : state
          }
          onChange={spy}
        >
          <Connected />
        </Provider>,
        div
      );
    });
    it("return new store if actionCreator returns an action", () => {
      expect(Demo.mock.calls[0][0].store.a).toBe(1); // first run..
      expect(Demo.mock.calls[0][0].store).toBe(store); // first run..

      return Demo.mock.calls[0][0].emit("trigger").then(r => {
        expect(Demo.mock.calls[1][0].store).not.toBe(store); // 2nd render was with store.a = 2
        expect(Demo.mock.calls[1][0].store.a).toBe(2); // 2nd render was with store.a = 2
      });
    });

    it("return same store if actionCreator didnot return action", async () => {
      aC.mockImplementationOnce(() => console.log("skip aC")); // should not change
      expect(Demo.mock.calls[0][0].store.a).toBe(1); // first run..
      expect(Demo.mock.calls[0][0].store).toBe(store); // first run..

      return Demo.mock.calls[0][0].emit("trigger").then(r => {
        // should remain same
        expect(Demo.mock.calls[0][0].store.a).toBe(1); // first run..
        expect(Demo.mock.calls[0][0].store).toBe(store); // first run..
      });
    });
  });

  describe("Integration", () => {
    const ac = jest.fn((eventName, data, emit) => {
      return demoAction;
    });

    const limitedAc = jest.fn((eventName, data, emit) => {
      return demoAction;
    });

    const asyncAc = jest.fn((eventName, data, emit) => {
      // console.log("Asunc........");
      return new Promise(r => {
        // console.log("in async, i will resolve after 300");
        setTimeout(r, 300);
      }).then(e => demoAction);
    });

    const noobAc = jest.fn((eventName, data, emit) => {
      return demoAction;
    });

    limitedAc.eventName = ["a", "b"];
    const store = { a: 42, b: 56 };
    let reducer = jest.fn(x => x);
    const actions = [ac, limitedAc, asyncAc, noobAc];
    const Demo = jest.fn(props => <div>Hello</div>);
    let Connected;

    let demoEventData = { a: 1 };
    let demoAction = { type: "action", value: demoEventData };
    let emit;
    beforeEach(() => {
      ReactDOM.unmountComponentAtNode(div);
      actions.map(fn => fn.mockClear()); // reset mocks
      // reducer.mockReset();
      // reducer.mockClear();
      reducer = jest.fn(x => x);
      // jest.clearAllMocks();
      Demo.mockClear();
      Demo.stateToProps = jest.fn(store => ({ store, x: 1 }));
      Connected = connect(Demo);

      ReactDOM.render(
        <Provider reducer={reducer} value={store} actions={actions}>
          <Connected />
        </Provider>,
        div
      );
      emit = Demo.mock.calls[0][0].emit;
      emit("Hello World", demoEventData);
    });

    it("should emit events that can be received by actionCreators", () => {
      expect(ac).toBeCalled();
      expect(ac.mock.calls[0][0]).toBe("Hello World");
      expect(ac.mock.calls[0][1]).toBe(demoEventData);
    });

    it("should limit events using eventName", () => {
      expect(limitedAc).not.toBeCalled();
    });

    it("should send events using matching eventName", () => {
      emit("a");
      emit("b");
      expect(limitedAc).toBeCalled();
      expect(ac.mock.calls.length).toBe(3);
      expect(limitedAc.mock.calls.length).toBe(2);
    });

    it("actionCreators can pass objects to reducers", async () => {
      expect(reducer).toBeCalled();

      // only init function called the reducer..
      // since actions has an async that will delay execution for 300ms
      expect(reducer.mock.calls.length).toBe(1);

      // await async fn to resolve
      await new Promise(done => setTimeout(done, 500));

      expect(reducer.mock.calls.length).toBe(4); // called once for each ac and once for init
      expect(reducer.mock.calls[1][1]).toBe(demoAction); // received action
      expect(reducer.mock.calls[2][1]).toBe(demoAction); // received action
      expect(reducer.mock.calls[3][1]).toBe(demoAction); // received action

      expect(reducer.mock.calls[3][0]).toBe(store); // received same store we started with
    });

    it("actionCreators can delay passing objects to reducers", () => {});
    it("actionCreators can skip reducers", () => {});
    it("actionCreators can emit a new action", () => {});
    it("Connected Containers Can inject its own actionCreators REALtime", () => {});
    it("reducers can update store only if new", () => {});
    it("store partial update doesnot affect other leaflets", () => {});
  });
});
