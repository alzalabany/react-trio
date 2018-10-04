// import { createSelector } from 'reselect'; // <-recommended
import { leaf } from "./types";
import reducer from "./reducer";

export const domain = store => store[leaf] || reducer.initialState;
export const getAuth = store => domain(store);
