import Graph from "../utils/Graph.js";
import {
  RawModelRelation,
  RawModelSet,
  RawModelType,
} from "./RawAlloyModel.js";

export interface AlloyModel {
  types: Map<string, AlloyModelType>;
  sets: Map<string, AlloyModelSet>;
  relations: Map<string, AlloyModelRelation>;
  hierarchyMap: [string, string][];
  hierarchyGraph: Graph<string>;
}

export type AlloyModelType = RawModelType;

// one set can have multiple parent types, like
//   `sig X in A + B {}`
// in the raw model, `X` would be two sets, one with parent `A` and one with parent `B`.
// we instead collect them into one set with two types.
export type AlloyModelSet = Omit<RawModelSet, "type"> & {
  types: string[];
};

// same for relations
export type AlloyModelRelation = Omit<RawModelRelation, "type"> & {
  types: string[][];
};
