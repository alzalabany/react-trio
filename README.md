# React-Trio

# MOVED TO Live at [Pubflux](https://github.com/alzalabany/react-pubflux)

[![NPM](https://img.shields.io/npm/v/react-trio.svg)](https://www.npmjs.com/package/react-trio) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A Simple yet Powerfull -200<line of code- Facebook Flux pattern implementation, inspired by Redux & new context api.

it use React's 16.3 new Contect Api mixed with Event Subscription,to focus on separation of concerns while building modern complex react applications !

> build your UI in complete separate from Business logic, a Structure that encourage spliting your app into multiple packages for max. code sharing and pleasent Developement Experince

## Install

```bash
npm install --save react-trio;
```

or

```bash
yarn add react-trio;
```

then add this script to your `package.json` to be able to generate Modules from command cli;

```json
  "scripts": {
    ....
    "trio":"trio dir=./src/sdk "
    ...
  }
```

Now to create our first module run

```bash
yarn trio counter users
```

this will create following folder structures

```js
|
|--src
|----sdk
|------Counter
|-------- types.js
|-------- selectors.js
|-------- reducer.js
|-------- actions.js
|-------- index.js
|-------- index.spec.js
|------Users
|-------- ... as Counter
|------index.js
|------index.spec.js
|--package.json
```

> you dont need all above, this is just a helper small gen. i find easier to create boilerplate.

- To Start you need to run your App with `<Provider />` from `react-trio`
- import { rootreducer, actions, selectors } from generated sdk folder and inject them as props into Provider

** Thats all setup is done **

### Connecting Components

> any logic code that does not depends on Enviroment, try to move it inside SDK folder

** this will help you in future to move sdk folder to external package and reuse most amount of code as possible, along with keeping consistent API/SDK for your applications **

#### Rules

- All components listen for specfic Events, and only work for them.. or listen for '\*' too everything, even reducers can skip actions of certain types and only get triggered for specific events only.
- Action Creator is place where most of your Business logic should go into;

- UI containers emit events
- Action Creators listen to those events, and act accordingly
  1.  Emit another Event, and start process allover again
  2.  return an Object with `type` attribute, in this case rootReducer will be triggered to try update App State

ActionCreators can be created on Application Boot, by providing them as Props to Provider, or event inside inside a container !

> Data Flow Image
>
> > > > IMAGE MISSING <<<<

open your src/index.js of your newly `create-react-app` and add

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

all props on Provider are optional except for "reducer"..

now you can use `react-trio` `connect` HOC to connect any component inisde your App.

> Provider is just a normal React Context.Provider, and connect is also a regular Context.Consumer

> you can avoid connect if you don't like HOC and use `import {Consumer} from react-trio` and use as you would normally do with Context.Consumer

## Components

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
class LoginContainer extends React.PureComponent {
  componentDidMount() {
    // Regiester some ActionCreators that Doesnot trigger Reducers, just listen to events
    // to update local state
    this.listeners = [
      this.props.listen("LOGIN_START", () => this.setState({ loading: true })),
      this.props.listen("LOGIN_END", () => this.setState({ loading: false })),
      this.props.listen("LOGIN_FAILED", (eventName, error) =>
        this.setState({ error })
      )
    ];
  }

  componentWillUnMount() {
    // Remove ActionCreators
    this.listeners.map(un => un());
  }

  attemptLogin = (username, password) => {
    // who care about validation !, let sdk do it for us :).
    this.props.emit("ATTEMPT_LOGIN", { username, password });
  };

  render() {
    return (
      <div>
        {this.state.loading && <Spinner> Please wait ... </Spinner>}

        {this.state.error && <Error> {this.state.error.reason} </Error>}

        <LoginForm
          currentUser={this.props.currentUser}
          onSubmit={this.attemptLogin}
          disabled={this.state.loading}
        />
      </div>
    );
  }
}

LoginContainer.stateToProps = (store, selectors) => ({
  currentUser: selectors.auth.getCurrentUser(store) // get slice of AppState
});

export default connect(LoginContainer);
```

above you will notice few things.

- using listen and emit, makes the UI very clean !
- this.props.listen return a function that unsubscribe listerner, so we call this function on _unmount_ to clear all subscriptions.
- we will not do any validation in UI, its the SDK job to do it and emit `LOGIN_FAILED` if it fail, this allow for maximum code sharing between project.
- **RULE OF THUMB:** if its not Enviroment dependent code, try to move it to SDK package.
- we used Static "stateToProps" to tell `trio` to inject part of store into our component
- we used selectors (2nd arg. in stateToProps) which is nothing more than same object that you supplied to `<Provider />`, Who want to Require('sdk/users/selectors') everytime ha.. ? **totally optional anyway**

example SDK code

```jsx
// selectors.js
export const getCurrentUser = store =>
  store[types.mountKey] || reducer.initialState;
```

just pure functions that get store and return a slice of it, we recommend using 'reselect' here.

```jsx
  // reducer.js
  export function reducer(state=reducer.initalState;, action){
    if(action.type === 'LOGIN_SUCCESS'){
      return action.data;
    }
    return state
  }
  reducer.initalState = {};
  reducer.eventName = ['LOGIN_SUCCESS','LOGIN_ANOTHER_EVENT']; // only get called if action.type === 'LOGINSUCCESS'
```

pure functions that can also limit when it get triggered by using static `eventName` prop.

example above reducer will only get triggered for actions with `action.type === LOGIN_SUCCESS || LOGIN_ANOTHER_EVENT`

```jsx
// action.js
async function loginActionCreator(event, data, emit) {
  // if(event !== 'LOGIN_ATTEMPT')return; // we dont need this, because we used eventName bellow.

  // step 1: validate Data;
  // -----------------------

  if (!data.username)
    return emit("LOGIN_FAILED", { message: "username is required" });
  if (!data.password)
    return emit("LOGIN_FAILED", { message: "password is required" });

  // step 2: trying to login
  // -----------------------

  emit("LOGIN_START");
  let user;
  try {
    user = await api.post("/login", data);
  } catch (e) {
    emit("LOGIN_FAILED", { message: "username or password doesnot match" });
  }
  emit("LOGIN_END");

  if (user && user.data.token) {
    // login success, and data has my token

    //step 3: return action to reducer to change appState
    // --------------------------------------------------
    return {
      type: "LOGIN_SUCCESS",
      data: user.data
    };
  }
}
loginActionCreator.eventName = "LOGIN_ATTEMPT"; // only responde to 'LOGIN_ATTEMPT'
```

Main part of `react-trio` app, and where most of business logic should execute.
it can be async, await for operations, and after it all finish, just return your action to be dispatched to rootReducer... or dont return anything at all and avoid calling reducers!;

Thats It, now your code inside ./sdk folder contain all business logic, and you have kept your ui logic clean and as minimal as possible.

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

## Major Releases

- 0.0.1 initial release
- 1.0.0 #Breaking change
  - renamed components to mach redux naming convention to make it easier to understand/upgrade
  - increase test coverage to > 80%
- 1.2.0 #Breaking change
  - remove default exports in favor for named exports
  - added combineReducers.type as a super special `action.type` which force all reducer to give in there initialState if its not already in AppState, help building initial appState on fly

## Todo

- improve HOC function, may be implementing `shouldComponentUpdate` if its proved to be worth it.
- consider moving logic to its own worker.
- consider enabling remote Event sourcing keep state tree on remote host.

## License

MIT © [alzalabany](https://github.com/alzalabany)
