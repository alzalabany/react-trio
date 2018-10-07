import { ADD, SUBTRACT } from "./types";
const initialState = 0;

// path: store.counter
function CounterReducer(state = initialState, action, store) {
  if (typeof action.value === "number" && !isNaN(action.value)) {
    return state + action.value;
  }

  return typeof state === typeof initialState
    ? state || initialState
    : initialState;
}
CounterReducer.eventName = [ADD, SUBTRACT];
CounterReducer.initialState = initialState;

export default CounterReducer;
