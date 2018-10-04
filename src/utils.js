export function subscribe(name, fn, eventStore) {
  if (Array.isArray(name)) return name.map(n => subscribe(n, fn, eventStore));

  if (!eventStore[name]) eventStore[name] = [];
  // mutate eventStore
  const idx = eventStore[name].push(fn) - 1;
  return () => eventStore[name].splice(idx, 1);
}
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  const emptyState = {};
  return function combination(state = emptyState, action) {
    let hasChanged = false;
    const nextState = {};
    if (!action || typeof action.type !== "string") {
      console.error(
        "All actions must contain a type attribute, eg: { type: String, ... }, we will ignore your action",
        action,
        state
      );
      return state;
    }
    reducerKeys.forEach(key => {
      let nextStateForKey;
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const initialState = reducer.initialState || null;
      const scope = reducer.eventName;

      if (
        action.type === "/trio/@@init/" ||
        (scope && scope !== "*" && scope.indexOf(action.type) === -1)
      ) {
        nextStateForKey = previousStateForKey || initialState;
      } else {
        nextStateForKey = reducer(previousStateForKey, action, state);
      }

      if (typeof nextStateForKey === "undefined") {
        console.error(
          "reducer named " +
            key +
            " returned undefined, you must return something !\n we will just ignore your action for this key and return previous/initial state for key..."
        );
        nextStateForKey = previousStateForKey || initialState;
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? nextState : state;
  };
}

export async function emit(event, data) {
  let actionCreators = [];

  if (Array.isArray(this.emitter["*"])) {
    actionCreators = this.emitter["*"];
  }

  if (Array.isArray(this.emitter[event])) {
    actionCreators = actionCreators.concat(this.emitter[event]);
  }

  let promises = actionCreators.map(
    async fn => await fn(event, data, this.emit, this.getState)
  );
  var actions;
  return Promise.all(promises)
    .then(result => {
      actions = result;
      return result.filter(r => r && typeof r.type === "string");
    })
    .then(actions =>
      actions.reduce((state, action) => this.reducer(state, action), this.state)
    )
    .then(newState => {
      const willChange = newState ? newState !== this.state : false;
      if (willChange) {
        this.setState(newState);
      }

      return {
        ok: true,
        actions,
        willChange,
        state: newState
      };
    })
    .catch(e => {
      console.error(
        "something bad happened while executing event:" + event,
        data,
        e
      );
      return {
        ok: false,
        actions,
        willChange: false,
        state: this.state
      };
    });
}
