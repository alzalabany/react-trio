
import { ADD, SUBTRACT } from "./types";
const initialState = 0

// path: store.counter
function counterReducer(state=initialState, action, store){
  let newState;
  console.log('State was', state, action);
  if(action.type === ADD)
    newState = state + action.data;
  else
    newState = state - action.data;

  return isNaN(newState) || typeof newState !== typeof initialState ? initialState : newState;
}
counterReducer.eventName = [ADD, SUBTRACT];
counterReducer.initialState = 0;

export default counterReducer;

