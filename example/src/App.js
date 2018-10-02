import React, { Component } from 'react';
import {withCore} from 'react-trio';
import Counter from './sdk/Counter';

class App extends Component {
  state = {loading:false};
  componentDidMount(){
    this.props.listen('LOADING_START',()=>this.setState({loading:true}));
    this.props.listen('LOADING_END',()=>this.setState({loading:false}));
  }
  componentWillUnmount(){
    this.remove.map(fn=>fn()); // remove all listeners
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Counter App
          </p>
        </header>
        <div style={{display:'flex'}}>
          <div style={{flex:1}}>
            <h5>State</h5>
          </div>
          <div style={{flex:1}}>
            <h5>App</h5>
            <div style={{display:'flex', borderTop:'1px solid',marginTop:10}}>
              <button onClick={()=>this.props.emit(Counter.types.SUBTRACT, 1)}> - </button>
              <h4> {this.props.value} </h4>
              <button onClick={()=>this.props.emit(Counter.types.ADD, 1)}> + </button>
            </div>

            {this.state.loading && <h5>... loading Started ...</h5>}

          </div>
          <div style={{flex:1}}>
            <h5>Store</h5>
            <code><pre>{JSON.stringify(this.props)}</pre></code>
            <h5>Log</h5>
            <code><pre>{localStorage.temp}</pre></code>
          </div>
        </div>
      </div>
    );
  }
}

App.stateToProps = (store,selectors)=>({
  store, // inject whole store
  value: selectors.counter.getCurrentCount(store),
})

export default withCore(App);
