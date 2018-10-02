import * as React from "react";
import t from "prop-types";
import { subscribe, combineReducers } from "./utils";

const noob = ()=>null;
const Context = React.createContext({
  listen: noob,
  emit: noob,
  store: {}
});

class ReactTrio extends React.Component {

  constructor(props) {
    super(props);
    this.emitter = {};

    // adding actions
    if( Array.isArray(props.actions) ){
      props.actions.map(fn=>subscribe(fn.eventName||'*', fn, this.emitter));
    }


    this.reducer = props.reducer;

    console.log(props, typeof props.reducer, typeof this.reducer);

    this.state = this.reducer(props.value || {}, {
      type: "/simpleflux/@@init/"
    });

    if(props.debug){
      console.log('simpleflux/@@init with '+Object.keys(this.emitter).join(',')+' events');
      console.log('initalState will be =', this.state);
    }
  }

  /**
   * return current AppState
   * @todo return a copy of state not actual, to prevent mutation.
   */
  getState = () => this.state;

  /**
   * emit action to be utelized by actionCreator or by UI
   */
  emit = (event, data) => {

      let actionCreators = [];

      if( Array.isArray(this.emitter['*']) ){
        actionCreators = this.emitter['*'];
      }

      if(Array.isArray(this.emitter[event])){
        actionCreators = actionCreators.concat(this.emitter[event]);
      }

      if(this.props.debug){
        console.log('will emit event: '+event);
        console.log('with data:', data);
        console.log('to actionCreators:', actionCreators);
      }

      let promises = actionCreators.map(async fn => await fn(event, data, this.emit, this.getState) );
      console.log('Promises', promises)
      return Promise.all(promises)
           .then(result=>{
            if(this.props.debug){
              console.log('actionsCreators resolved for :'+event, result);
            }
            return result.filter(r=>r && typeof r.type==='string')
          })
           .then(actions=>{
            if(this.props.debug){
              console.log('actions generated:', actions);
            }
            const data = actions.reduce((state, action)=>this.reducer(state, action),this.state);
            console.log('new State after applying actions to reducers ',data);
            return data;
          })
           .then(newState=>{
            if(newState && newState !== this.state){
              if(this.props.debug){
                console.log('@@State Will Change', newState);
              }
              this.setState(newState);
            }
            if(this.props.debug){
              console.log('@@END working event: '+event, newState);
            }
            return newState;
           })
           .catch(e=>{
            console.error('something bad happened while executing event:'+event, data, e);
            console.info(promises);
           })
  };

  /**
   * used by ui to listen to events
   */
  listen = (eventName, cb) => {
    return subscribe(eventName, cb, this.emitter);
  };

  componentDidUpdate() {
    // A hook for persisting to storage or whatever
    // @@todo: explore option to remove this and added it as callback to setState to avoid calling this on initalMount !
    // --------------------------------------------
    this.props.onChange && this.props.onChange(this.state, this.stack);
    if(this.props.debug){
      console.log('@@simpleflux: will call onChange because component Did Update !');
    }
  }

  render() {
    const { emit, listen } = this;
    return (
      <Context.Provider
        value={{
          store: this.state,
          emit,
          listen,
          selectors: this.props.selectors // just a proxy to avoid import X form '../../../sdk/MODULE/selectors' shit..
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

ReactTrio.displayName = "Core";
ReactTrio.propTypes = {
  debug: t.bool,
  reducer: t.func.isRequired,
  actions: t.arrayOf(t.func).isRequired,
  onChange: t.func,
  value: t.any
};

const Connect = Context.Consumer;



const withCore = Component => {
  const selectProps = Component.stateToProps;
  const extraProps = ({store, selectors}) => typeof selectProps === "function"
        ? selectProps(store, selectors)
        : { store, selectors };
  return React.forwardRef((props, ref) => {
    return (
      <Connect>
        {data => (
          <Component
            {...props}
            {...extraProps(data)}
            ref={ref}
            emit={data.emit}
            listen={data.listen}
          />
        )}
      </Connect>
    );
  });
};

export {
  combineReducers,
  subscribe,
  withCore,
  Connect,
  ReactTrio as Provider
};
export default ReactTrio;
