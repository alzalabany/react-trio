
import { leaf } from "./types";
export const domain = store => store[leaf];

export const getCurrentCount = store => domain(store);
