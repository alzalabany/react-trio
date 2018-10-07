import { ADD, SUBTRACT } from "./types";
import { getCurrentCount } from "./selectors";
// import API from "../../api";

/**
 * emits : []
 * reducer: [ONLOAD]
 */
export async function countAction(eventName, data, emit, getState) {
  const state = getCurrentCount(getState());
  if ((data + state) % 5 === 0) {
    // lets delay execution for 3 sec :-)
    emit("LOADING_START");
    setTimeout(() => emit("LOADING_END"), 1000); // non-blocking
  }

  return {
    type: ADD,
    value: eventName === SUBTRACT ? data * -1 : data
  }; // return empty action to reducer
}
countAction.eventName = [ADD, SUBTRACT];

export default [countAction];
