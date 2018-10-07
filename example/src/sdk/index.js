import Power from "./Power";
import Auth from "./Auth";
import Counter from "./Counter";
import { combineReducers } from "react-trio";

export const rootReducer = combineReducers({
  [Power.types.leaf]: Power.reducer,

  [Auth.types.leaf]: Auth.reducer,

  [Counter.types.leaf]: Counter.reducer
});

export const actions = [...Power.actions, ...Auth.actions, ...Counter.actions];

export const selectors = {
  [Power.types.leaf]: Power.selectors,
  [Auth.types.leaf]: Auth.selectors,
  [Counter.types.leaf]: Counter.selectors
};

// Load app state from Storage.. example:
export const loadFromDisk = () => JSON.parse(localStorage.myApp || "{}");

// Load app state to Storage.. example:
export const saveToDisk = state => {
  console.log("App state changed", state);
  localStorage.setItem("myApp", JSON.stringify(state));
};
