# React-Trio

>

[![NPM](https://img.shields.io/npm/v/react-trio.svg)](https://www.npmjs.com/package/react-trio) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-trio
```

a simple -200<line of code- Facebook Flux pattern implementation, inspired by Redux & new context api.

it use React's 16.3 new Contect Api mixed with Event Subscription,to focus on separation of concerns while building modern complex react applications !

> build your UI completely based on events you emit, and responde to em in your action, very neat.

## Components

just like redux we have

### Action creator

it create an action (simple object with a type) and send it to the reducer.

### Reducer

receive an action and return a new version of App State

### Connected Component / smart+or-dump components

someone who responde to user actions by emitting an event !.

#### Example Usage


### example Login Component

login.js
```jsx
  class LoginContainer extends React.PureComponent{

    componentDidMount(){
      this.listeners = [
        this.props.listen("LOGIN_START", ()=>this.setState({loading:true})),
        this.props.listen("LOGIN_END", ()=>this.setState({loading:false})),
        this.props.listen("LOGIN_FAILED", (eventName, error)=>this.setState({error})),
      ];
    }

    componentWillUnMount(){
      this.listeners.map(un=>un());
    }

    attemptLogin = (username, password) => {
      this.props.emit("ATTEMPT_LOGIN", {username, password})
    }

    render(){
      return <div>

          {this.state.loading && <Spinner> Please wait ... </Spinner>}

          {this.state.error && <Error> {this.state.error.reason} </Error>}

          <LoginForm
            onSubmit={this.attemptLogin}
            disabled={this.state.loading}
          />

      </div>
    }

  }

  LoginContainer.stateToProps = (store, selectors) => ({
    currentUser: selectors.auth.getCurrentUser(store),
  })

  export default withCore(LoginContainer);
```

above you will notice few things.

- using listen and emit, makes the UI very clean !
- this.props.listen return a function that unsubscribe listerner, so we call this function on *unmount* to clear all subscriptions.
- we will not do any validation in UI, its the SDK job to do it and emit `LOGIN_FAILED` if it fail, this allow for maximum code sharing between project.
- **RULE OF THUMB:** if its not Enviroment dependent code, try to move it to SDK package.

example SDK code

```jsx
  // selectors.js
  export const getCurrentUser =  store => store[types.mountKey] || reducer.initialState;

  // reducer.js
  export function reducer(state=reducer.initalState;, action){
    if(action.type === 'LOGIN_SUCCESS'){
      return action.data;
    }
    return state
  }
  reducer.initalState = {};
  reducer.eventName = ['LOGIN_SUCCESS']; // only get called if action.type === 'LOGINSUCCESS'


  // action.js
  async function loginActionCreator(event, data, emit){

    // if(event !== 'LOGIN_ATTEMPT')return; // we dont need this, because we used eventName bellow.

    // step 1: validate Data;
    // -----------------------

    if( !data.username )
      return emit('LOGIN_FAILED',{message:'username is required'});
    if( !data.password )
      return emit('LOGIN_FAILED',{message:'password is required'});

    // step 2: trying to login
    // -----------------------

    emit('LOGIN_START');
    let user;
    try{
      user = await api.post('/login', data);
    }catch(e){
      emit('LOGIN_FAILED',{message:'username or password doesnot match'});
    }
    emit('LOGIN_END');

    if(user && user.data.token){
      // login success, and data has my token

      //step 3: return action to reducer to change appState
      // --------------------------------------------------
      return {
        type: 'LOGIN_SUCCESS',
        data: user.data,
      }
    }
  }
  loginActionCreator.eventName = 'LOGIN_ATTEMPT'; // only responde to 'LOGIN_ATTEMPT'
```

Thats It, now you have your smart actionCreator inside your ./sdk folder contain all business logic, and you have kept your ui logic clean and as minimal as possible.

this allow you to share ./sdk folder with your mobile/web/other project easily, you can pack it into its own npm package and simply npm install it. **MAXIMUM code share :)**

## So how it works ?

we give Action creators and connected components some super powers. so Typical life cycle is as so.

- _On UI part_ User Create An Event(click on button, or scroll, or whatever)
- Component Respond to that action by calling this.props.emit("EVENT_NAME",eventData);
- _On SDK side_ Actions listening for this "EVENT_NAME" will get triggered -asyncly-
- Action can Do 2 things now -since this can be async function-
  - return plain action -an object with type: prop-
  - emit another event (which will reset this cycle)
- Reducer receive event returned by ActionCreator and change state !
- All connected components get notified !

Why we think this is better ?

- UI designers now need to worry about just Emitting Events, no more complex bindActionCreator, or magical functions gets imported and injected into our component
- App developers can develope whole SDK in conjunction with backend, without worrying about front end or presentation.
- Its much faster -and safer- to run only reducers who subscribe to an event, not all reducers in chain !

## Example

_index.js_

```jsx
import { actions, rootReducer, selectors } from "./sdk";

// or whatever logic you want to persist !
const loadedFromDisk = JSON.parse(localStorage.myApp || "{}");
const saveToDisk = state =>
  localStorage.setItem("myApp", JSON.stringify(state));

React.Render(
  <Provider
    reducer={rootReducer}
    actions={actions}
    selectors={selectors}
    onChange={saveToDisk}
    initalState={loadedFromDisk}
  >
    <MyApp />
  </Provider>,
  rootEl
);
```

your sdk/index.js would look something like

```jsx
import Users from "./auth";
import Todos from "./todos";
import { combineReducers } from "react-trio";

export const rootReducer = combineReducers({
  [User.types.mountKey]: Users.reducer,
  [Todos.types.mountKey]: Todos.reducer
});

export const selectors = [...Users.selectors, ...Todos.selectors];

export const actions = [...Users.actions, ...Todos.actions];
```

every time you create a new module inside sdk folder, just add a referenec for it in you sdk/index.js file so that it would be included in your app.

A module folder recommended folder structure would be

- index.js
- actions.js
- selectors.js
- types.js
- reducer.js

> Recommendation: create a small node/terminal tool that help you generate such boilerplate, for a better development experience !, we included a generator.js inside our ./src folder as an example.

index.js

```jsx
import reducer from "./reducer";
import actions from "./actions";
import * as selectors from "./selectors";
import * as types from "./types";

export default {
  reducer,
  actions,
  selectors,
  config
};
```

reducer.js

```jsx
import { ONLOAD } from "./types";
const initialState = {};

function userReducer(state = initialState, action, store) {
  return state;
}
userReducer.eventName = [ONLOAD];
userReducer.initialState = initialState;

export default userReducer;
```

actions.js

```jsx
import { ONLOAD } from "./types";
// import API from "../../api";

async function loadAction(eventName, data, emit, getState) {
  // - i can await an api call before i return !

  // -OR i can also re-emit an event
  // but careful not fall into a loop !

  // emit("API_STARTING",data);
  // const data = api.get();
  // emit("API_END",data);

  // very useful for showing spinner !

  return null; // since no object with {type:''} this will not trigger any reducer.
  // useful when api fail, no need to trigger reducers..

  // example if api success and you need to call reducers
  // return {
  //   type: ONLOAD,
  //   data: whatever
  // }
}
loadAction.eventName = ONLOAD;

export default [loadAction];
```

selectors.js

```jsx
  import * as types from './types';
  import reducer from './reducer';

  export const getTodos = store => store[types.mountKey] || reducer.initialState;
```



## Todo

- improve HOC function, may be implementing `shouldComponentUpdate` if its proved to be worth it.
- consider moving logic to its own worker.
- consider enabling remote Event sourcing keep state tree on remote host.


## License

MIT © [alzalabany](https://github.com/alzalabany)
