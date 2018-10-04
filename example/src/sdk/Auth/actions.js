import { ONLOAD } from "./types";
// import API from "../../api";

/**
 * emits : []
 * reducer: [ONLOAD]
 */
async function loadAction(eventName, data, emit, getState) {
  return {
    type: ONLOAD,
  }; // return empty action to reducer
}
loadAction.eventName = ONLOAD;

export default [loadAction];

