import {
  RawInstanceAtom,
  RawInstanceRelation,
  RawInstanceSet,
  RawInstanceType,
} from "./RawAlloyInstance.js";

export type AlloyInstanceAtom = RawInstanceAtom;
export type AlloyInstanceType = RawInstanceType;
export type AlloyInstanceSet = RawInstanceSet;
export type AlloyInstanceRelation = RawInstanceRelation;

export interface AlloyInstance {
  types: AlloyInstanceType[];
  sets: AlloyInstanceSet[];
  relations: AlloyInstanceRelation[];
}
