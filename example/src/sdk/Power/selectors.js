// import { createSelector } from 'reselect'; // <-recommended
import { leaf } from "./types";
import reducer from "./reducer";

export const domain = store => store[leaf] || reducer.initialState;
export const head = store => domain(store).head || "master";
export const logs = store => domain(store).log || {};
export const log = store => {
  const branch = head(store);
  const Log = logs(store);
  return Log[branch] || [];
};
