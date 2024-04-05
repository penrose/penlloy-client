import { ModelElementDescriptor } from "./RawAlloyModel.js";

export type DomainType = DomainSingleType | DomainMultipleType;

export type DomainSingleType = ModelElementDescriptor & {
  tag: "DomainSingleType";
  contents: string;
};
export type DomainMultipleType = ModelElementDescriptor & {
  tag: "DomainMultipleType";
  contents: string[];
};

export interface DomainSubType {
  tag: "DomainSubType";
  sub: DomainType;
  sup: DomainType;
}

export type DomainRel = ModelElementDescriptor & {
  tag: "DomainRel";
  name: string;
  types: DomainType[];
};

export type DomainSet = ModelElementDescriptor & {
  tag: "DomainSet";
  name: string;
  type: DomainType;
};

export type DomainObject = DomainType | DomainSubType | DomainRel | DomainSet;
