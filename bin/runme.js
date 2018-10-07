#!/usr/bin/env node
/**
 * A node generator that generate Module Folder with all required boilerplate files
 * index.js
 * actions, reducer, type, selectors
 *
 * it will also edit index.js file to add ref. for newly created files
 */
const fs = require("fs");
const path = require("path");

/**
 * Capitalize first letter
 * @param  {string} n [name to capitalize]
 * @return {string}   ucfirst
 */
const c = n => n[0].toUpperCase() + n.slice(1).toLowerCase();

/**
 * Return Relative path
 * @param  {string} file name
 * @return {string} full path
 */
const dir = n => path.join(process.cwd(), homePath, c(n));

/**
 * Return Fullpath for a Folder inside destination folder
 * @param  {string} n module name
 * @param  {string} f filename
 * @return {string}   fullpath for ToBe created [sdk path]/[Module Name]/[file name]
 */
const d = (n, f) => path.join(dir(c(n)), "./" + f);

const names = [];
let homePath = "./src/sdk";

process.argv.slice(2).forEach(option => {
  if (option.indexOf("dir=") === 0) {
    homePath = option
      .split("=")
      .slice(1)
      .join();
  } else {
    names.push(c(option));
  }
});

if (names.length < 1) throw console.error("no names supplied");

const selectorsTmbl = n => `// import { createSelector } from 'reselect'; // <-recommended
import { leaf } from "./types";
import reducer from "./reducer";

export const domain = store => store[leaf] || reducer.initialState;
export const get${c(n)} = store => domain(store);
`;

const typesTmbl = n => `
export const leaf = '${n.toLowerCase()}';
export const ONLOAD = '/${n.toUpperCase()}/ONLOAD/';
`;

const reducerTmbl = n => `// import { ONLOAD } from "./types";
const initialState = {}

// path: store.${n.toLowerCase()}
function ${n}Reducer(state=initialState, action, store){

  return state;
}
${n}Reducer.eventName = [];
${n}Reducer.initialState = initialState;

export default ${n}Reducer;

`;

const actionsTmbl = n => `import { ONLOAD } from "./types";
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

`;

const indexTmbl = n => `import reducer from "./reducer";
import actions from "./actions";
import * as selectors from "./selectors";
import * as types from "./types";

export default {
  reducer,
  actions,
  selectors,
  types
};
`;
const indexSpecTmbl = n => `import ${n} from "./index";

it("${n} module export required components", () => {
  expect(typeof ${n}.reducer).toBe("function");

  expect(Array.isArray(${n}.actions)).toBeTruthy();

  expect(${n}.types).toBeTruthy();
  expect(typeof ${n}.types.leaf).toBe("string");

  expect(${n}.selectors).toBeDefined();
});

`;

const sdkIndexTmpl = `import { combineReducers } from 'react-trio';

export const rootReducer = combineReducers({

});

export const actions = [

]

export const selectors = {

}

// Load app state from Storage.. example:
// export const loadFromDisk = () => JSON.parse(localStorage.myApp || "{}");

// Load app state to Storage.. example:
// export const saveToDisk = state => localStorage.setItem("myApp", JSON.stringify(state));
`;

const sdkIndexSpecTmpl = n => `import ${n} from "./index";

describe("${n} Module", () => {
  //const [ action1 ] = ${n}.actions;
  // const { TYPE1 } = ${n}.types;
  const Reducer = ${n}.reducer;

  it("${n} module export required components", () => {
    expect(typeof ${n}.reducer).toBe("function");

    expect(Array.isArray(${n}.actions)).toBeTruthy();

    expect(${n}.types).toBeDefined();
    expect(typeof ${n}.types.leaf).toBe("string");

    expect(${n}.selectors).toBeDefined();
  });

  describe("Reducer", () => {
    it("has initialState", ()=> expect(Reducer.initialState).toBeDefined() )

    it("correct corrupt states with initialState", () => {

      expect(Reducer(undefined, { type: "X" })).toBe(Reducer.initialState);
      expect(Reducer(null, { type: "X" })).toBe(Reducer.initialState);
      expect(Reducer(false, { type: "X" })).toBe(Reducer.initialState);

      // optional..
      // expect(Reducer(0, { type: "X" })).toBe(0);
      // expect(Reducer(-1, { type: "X" })).toBe(-1);
    });

    // other logic specific tests
  });

  describe("Actions", () => {
    // replace X with your action name
    // const action1 = await Action1(${n}.types.X);

    it("can create an X action", async () => {
      // expect(action1).toEqual({ type: ${n}.types.X });
    });

    it("integrate well with reducer implementation", async () => {
      // expect( Reducer(0, aciton1) ).toBe(XYZ);
    });
  });

  describe("Selectors & integration", () => {
    let rootReducer, appState;
    const { combineReducers } = require("react-trio");
    beforeEach(() => {
      rootReducer = combineReducers({
        [${n}.types.leaf]: ${n}.reducer
      });

      appState = rootReducer(null, { type: combineReducers.type });

      // combineReducer returned expected AppState, to doublecheck uncomment this
      // expect(appState).toEqual({ [${n}.types.leaf]: Reducer.initialState });
    });

    it("select domain", async () => {
      // Domain selector return Module leaf from AppState
      expect(${n}.selectors.domain(appState)).toEqual(Reducer.initialState);
    });
  });
});
`;

names.map(async n => {
  const moduleName = c(n);
  console.log("-+--+--+--+--+--+--+--+--+--+--+--+--+--+");
  console.log("Creating " + moduleName + " @" + d(n, "*.js"));

  const hasSdkFolder = fs.existsSync(dir("./index.js")); // sdk exsists ?

  if (!hasSdkFolder) {
    console.log("sdk folder doesNot exsists, creating one...");
    fs.mkdirSync(path.join(process.cwd(), homePath));
    //create folder/index.js
    fs.writeFileSync(dir("./index.js"), sdkIndexTmpl);
    fs.writeFileSync(
      dir("./" + moduleName + ".spec.js"),
      sdkIndexSpecTmpl(moduleName)
    );
  }

  /**
   * Create Module folder
   */
  try {
    fs.mkdirSync(dir(n));
  } catch (err) {
    if (err.code === "EEXIST") {
      return console.error("already exsists.. skipping");
    } else {
      // ignore anyother
      console.error("couldnot create folder @" + n);
      console.error("----------------------------");
      return console.error(err);
    }
  }

  /**
   * Write boilerplate code
   */
  fs.writeFileSync(d(n, "selectors.js"), selectorsTmbl(n));
  fs.writeFileSync(d(n, "types.js"), typesTmbl(n));
  fs.writeFileSync(d(n, "actions.js"), actionsTmbl(n));
  fs.writeFileSync(d(n, "reducer.js"), reducerTmbl(n));
  fs.writeFileSync(d(n, "index.js"), indexTmbl(n));
  fs.writeFileSync(d(n, "index.spec.js"), indexSpecTmbl(n));

  /**
   * Get current [SDk path]/index.js path to append imports to it.
   * @type {[type]}
   */
  const index = fs.readFileSync(dir("./index.js"), "utf8");

  if (index.indexOf("moduleName") > -1) {
    return console.error(
      "already exsists in sdk/index.js, will not import " +
        moduleName +
        " again"
    );
  }

  /**
   * Split index.js to inject reducer in middle..
   */
  const idx = index.split("combineReducers({");

  // 1. added import statement to top of file
  // 2. added reducer ref inside combineReducers config object
  let nIndex =
    `import ${moduleName} from './${moduleName}';\n` +
    idx[0] +
    `combineReducers({\n\t[${moduleName}.types.leaf]: ${moduleName}.reducer,\n` +
    idx[1];

  // 3. inject actions into global actions array
  nIndex = nIndex.replace(
    "actions = [",
    `actions = [
    ...${moduleName}.actions, `
  );

  // 3. inject selectors into global selectors object
  nIndex = nIndex.replace(
    "selectors = {",
    `selectors = {
  [${moduleName}.types.leaf]: ${moduleName}.selectors,`
  );

  // 4. Finally update index.js file with new content :-).
  fs.writeFileSync(dir("./index.js"), nIndex);
  console.log("Injected " + moduleName + " into @" + dir("./index.js"));
});
