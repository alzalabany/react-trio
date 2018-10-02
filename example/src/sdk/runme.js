/**
 * A node generator that generate Module Folder with all 5 files
 * index.js
 * actions, reducer, config, type, selectors
 *
 * it will also edit index.js file to add ref. for newly created files
 */
const fs = require("fs");
const path = require("path");
const names = process.argv
  .slice(2)
  .filter(i => i[0] !== "-")
  .map(i => i.toLowerCase());
const atHome = process.argv.indexOf("--home") > -1;
const p = process.argv[1]
  .split("/")
  .slice(0, -1)
  .join("/");
const c = n => n[0].toUpperCase() + n.slice(1).toLowerCase();
const dir = n => path.join(atHome ? p : process.cwd(), c(n));
const d = (n, f) => path.join(dir(c(n)), "./" + f);
if (names.length < 1) throw console.error("no names supplied");

names.map(n => {
  console.log("\nCreating ::" + n);

  fs.mkdirSync(dir(n));

// do we need a config file ?, i think types.js can hold such data just fine !
//   fs.writeFileSync(
//     d(n, "config.js"),
//     `
// export const leaf = "${n.toLowerCase()}"
// export const endpoint = {
//   getAll: () => '/${n.toLowerCase()}/'
// };
// `
//   );

  fs.writeFileSync(
    d(n, "selectors.js"),
    `
import { leaf } from "./types";
export const domain = store => store[leaf];
export const get${c(n)} = store => domain(store);
`
  );

  fs.writeFileSync(
    d(n, "types.js"),
    `
export const leaf = '${n.toLowerCase()}';
export const ONLOAD = '/${n.toUpperCase()}/ONLOAD/';
`
  );

  fs.writeFileSync(
    d(n, "index.js"),
    `
import reducer from "./reducer";
import actions from "./actions";
import * as selectors from "./selectors";
import * as types from "./types";

export default {
  reducer,
  actions,
  selectors,
  types
};
`
  );

  fs.writeFileSync(
    d(n, "actions.js"),
    `
import { ONLOAD } from "./types";
// import API from "../../api";

/**
 * emits : []
 * reducer: [ONLOAD]
 */
async function loadAction(eventName, data, emit, getState) {
  return {
    type: ONLOAD,
  }; // return empty action to reducer
}
loadAction.eventName = ONLOAD;

export default [loadAction];
`
  );

  fs.writeFileSync(
    d(n, "reducer.js"),
    `
// import { ONLOAD } from "./types";
const initialState = {}

// path: store.${n.toLowerCase()}
function ${n}Reducer(state=initialState, action, store){

  return state;
}
${n}Reducer.eventName = [];
${n}Reducer.initialState = initialState;

export default ${n}Reducer;

`
  );
  const index = fs.readFileSync(dir("./index.js"), "utf8");
  const idx = index.split("combineReducers({");
  let nIndex =
    `import {${c(n)}} from './${c(n)}'\n` +
    idx[0] +
    `combineReducers({
  [${c(n)}.types.leaf]: ${c(n)}.Reducer,` +
    idx[1];

  nIndex = nIndex.replace(
    "actions = [",
    `actions = [
    ...${c(n)}.actions, `
  );
  nIndex = nIndex.replace(
    "selectors = {",
    `selectors = {
  [${c(n)}.types.leaf]: ${c(n)}.selectors,`
  );
  fs.writeFileSync(dir("./index.js"), nIndex);
});
