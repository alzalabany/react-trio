import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from "react-trio";
import './index.css'
import App from './App'
import {actions, rootReducer, selectors, saveToDisk, loadFromDisk} from './sdk';


async function logger(eventName, data, emit, getState){
  // you can do lots of magic in your actions.. here is few examples.
  // this action has a * for eventName, so it will responde to any "emit" in your app.
  // can be very useful as a spy/logger
  console.log(eventName,'was fired with data:', data);

  /**
   * A. show loading spinner without poluting App State
   */

  // <--- never forget to skip events you emit ! or you will have a nice loop in place
  if(eventName.indexOf('LOADING')===0) return;

  emit('LOADING_START');

  /**
   * B. here i will debounce all fireing rate !
   * any action must wait for this to resolve before all values return to reducer
   * go ahead, try to click + very fast ! i will stop you :p
   */
  await new Promise(r=>setTimeout(r,1000));


  // now lets hide it since our async work is done !
  emit('LOADING_END');

  // i dont want to signal reducers :-)
  // otherwise i would hv returned an Object with {type: String}
  return null;
}
logger.eventName = '*' // you could also remove this line and it would work just same

console.log(loadFromDisk());
ReactDOM.render(  <Provider
    debug={true}
    reducer={rootReducer}
    actions={actions.concat(logger)}
    selectors={selectors}
    onChange={saveToDisk}
    value={loadFromDisk()}
  ><App /></Provider>, document.getElementById('root'))
