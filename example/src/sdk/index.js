import {combineReducers} from 'react-trio';
import Counter from './Counter'

export const rootReducer = combineReducers({
  [Counter.types.leaf]: Counter.reducer,
});

export const actions = [
...Counter.actions,
]

export const selectors = {
[Counter.types.leaf]: Counter.selectors,
}

export const loadFromDisk = () => JSON.parse(localStorage.myApp || "{}");

export const saveToDisk = state =>
  localStorage.setItem("myApp", JSON.stringify(state));
