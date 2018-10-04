import Auth from './Auth';
import Counter from './Counter';
import { combineReducers } from 'react-trio';

export const rootReducer = combineReducers({
	[Auth.types.leaf]: Auth.Reducer,

	[Counter.types.leaf]: Counter.Reducer,


});

export const actions = [
    ...Auth.actions, 
    ...Counter.actions, 

]

export const selectors = {
  [Auth.types.leaf]: Auth.selectors,
  [Counter.types.leaf]: Counter.selectors,

}

// Load app state from Storage.. example:
// export const loadFromDisk = () => JSON.parse(localStorage.myApp || "{}");

// Load app state to Storage.. example:
// export const saveToDisk = state => localStorage.setItem("myApp", JSON.stringify(state));
