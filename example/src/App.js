import React, { Component } from "react";
import { connect } from "react-trio";
import Counter from "./sdk/Counter";
import Power from "./sdk/Power";

class App extends Component {
  state = { loading: false };
  componentDidMount() {
    this.props.listen("LOADING_START", () => this.setState({ loading: true }));
    this.props.listen("LOADING_END", () => this.setState({ loading: false }));
  }
  componentWillUnmount() {
    this.remove.map(fn => fn()); // remove all listeners
  }
  createBranch = () => {
    const name = prompt("branch name ?");
    if (name) this.props.emit(Power.types.CHECKOUT, name);
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>Counter App</p>
        </header>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: "5vw" }}>
            <h5>App</h5>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                borderTop: "1px solid",
                marginTop: 10
              }}
            >
              <button
                style={{ flex: 1 }}
                disabled={!!this.state.loading}
                onClick={() => this.props.emit(Counter.types.SUBTRACT, 1)}
              >
                {" "}
                -{" "}
              </button>
              <h4> {this.props.value} </h4>
              <button
                style={{ flex: 1 }}
                disabled={!!this.state.loading}
                onClick={() => this.props.emit(Counter.types.ADD, 1)}
              >
                {" "}
                +{" "}
              </button>
            </div>

            {this.state.loading && <h5>... loading Started ...</h5>}
          </div>
          <div style={{ flex: 1, maxWidth: "30%" }}>
            <h5>
              Log :${this.props.branch}
              {"-" + this.props.log.length + " event stored-"}
              <select
                value={this.props.branch}
                onChange={e =>
                  this.props.emit(Power.types.CHECKOUT, e.target.value)
                }
              >
                {this.props.branches.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <button onClick={this.createBranch}>New branch</button>
            </h5>
            <code>
              <pre>{JSON.stringify(this.props.log, null, 2)}</pre>
            </code>
            <h5>
              What to build somthing cool ? how about an event sourcing with
              simple diff to simulate github ? or just click
            </h5>
            <button onClick={() => this.props.emit(Power.types.REPLAY)}>
              replay events
            </button>
          </div>
        </div>
      </div>
    );
  }
}

App.stateToProps = (store, selectors) => ({
  store, // inject whole store
  value: selectors.counter.getCurrentCount(store),
  log: selectors.log.log(store),
  branch: selectors.log.head(store),
  branches: Object.keys(selectors.log.logs(store)).filter(n => n !== "head")
});

const ConenctdApp = connect(App);

const { Provider } = require("react-trio");
const {
  actions,
  rootReducer,
  selectors,
  saveToDisk,
  loadFromDisk
} = require("./sdk");

export default ({ addon = [a => console.log("Action :" + a)] }) => (
  <Provider
    debug={false}
    reducer={rootReducer}
    actions={[...actions, ...addon]}
    selectors={selectors}
    onChange={saveToDisk}
    value={loadFromDisk()}
  >
    <ConenctdApp />
  </Provider>
);
