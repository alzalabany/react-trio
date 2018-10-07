import { combineReducers } from "react-trio";
import { head, log } from "./selectors";
import { CHECKOUT, SAVE_LOG } from "./types";

// path: store.log.head
function PowerReducer(state = "master", action, store) {
  return action.name || state;
}
PowerReducer.eventName = CHECKOUT;
PowerReducer.initialState = "master";

// path: store.log.log[branch_name]
function LogReducer(state = LogReducer.initialState, action, store) {
  if (action.type === CHECKOUT) {
    return {
      ...state,
      [action.name]: state[action.name] || []
    };
  }

  const head_name = store.head || "master"; // head name;
  const src = state[head_name] || []; // saving spot
  return {
    ...state,
    [head_name]: src.concat(action.data)
  };
}
LogReducer.eventName = [SAVE_LOG, CHECKOUT];
LogReducer.initialState = {};

const reducer = combineReducers({
  head: PowerReducer,
  log: LogReducer
});

reducer.initialState = {
  head: PowerReducer.initialState,
  log: LogReducer.initialState
};

export default reducer;
