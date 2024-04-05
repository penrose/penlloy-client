export interface RawInstance {
  filename: string;
  commandname: string;
  isMetamodel: boolean;

  types: RawInstanceType[];
  sets: RawInstanceSet[];
  relations: RawInstanceRelation[];
}

export interface RawInstanceType {
  name: string;
  atoms: RawInstanceAtom[];
}

export interface RawInstanceAtom {
  type: string;
  index: number;
}

export interface RawInstanceSet {
  name: string;
  atoms: RawInstanceAtom[];
}

export interface RawInstanceRelation {
  name: string;
  tuples: RawInstanceAtom[][];
}
