import { SAVE_LOG, CHECKOUT, REPLAY } from "./types";
import { log } from "./selectors";
// import API from "../../api";

/**
 * emits : []
 * reducer: [ONLOAD]
 */
async function checkoutAction(eventName, data, emit, getState) {
  if (eventName === CHECKOUT) {
    if (data === "head")
      return emit(
        "CHECKOUT_FAILED",
        "select a valid name other than reserved 'head' or 'master'"
      );

    if (typeof data !== "string")
      return emit(
        "CHECKOUT_FAILED",
        "select a valid name other than reserved 'head' or 'master'"
      );

    return {
      type: CHECKOUT,
      name: data
    };
  }

  return {
    type: SAVE_LOG,
    noreplay: eventName === REPLAY || data.noreplay,
    data: { eventName, data }
  }; // return empty action to reducer
}
checkoutAction.eventName = "*";

function replay(e, _, emit, getState) {
  const events = log(getState()).filter(
    l => l.eventName !== REPLAY && !l.noreplay
  ); // avoid replaying a replay command :D..
  console.log("The log is ", events);
  for (let i in events) {
    let l = events[i];
    setTimeout(() => emit(l.eventName, l.data), i * 1000);
  }
  return;
}
replay.eventName = REPLAY;

export default [checkoutAction, replay];
