export type AlloyInstanceNumber = {
  tag: "Number";
  contents: number;
};
export type AlloyInstanceString = {
  tag: "String";
  contents: string;
};
export type AlloyInstanceOtherAtom = {
  tag: "Atom";
  type: string;
  index: number;
};

export type AlloyInstanceAtom =
  | AlloyInstanceNumber
  | AlloyInstanceString
  | AlloyInstanceOtherAtom;

export type AlloyInstanceType = {
  name: string;
  atoms: AlloyInstanceAtom[];
};
export type AlloyInstanceSet = {
  name: string;
  atoms: AlloyInstanceAtom[];
};
export type AlloyInstanceRelation = {
  name: string;
  tuples: AlloyInstanceAtom[][];
};

export interface AlloyInstance {
  types: AlloyInstanceType[];
  sets: AlloyInstanceSet[];
  relations: AlloyInstanceRelation[];
}
