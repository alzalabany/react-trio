
import { SUBTRACT, ADD } from "./types";
// import API from "../../api";

/**
 * emits : []
 * reducer: [ONLOAD]
 */
async function loadAction(eventName, data, emit, getState) {
  return {
    type: eventName,
    data,
  }; // return empty action to reducer
}
loadAction.eventName = [SUBTRACT, ADD];

export default [loadAction];
