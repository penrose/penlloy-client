export interface RawModel {
  types: RawModelType[];
  sets: RawModelSet[];
  relations: RawModelRelation[];
  hierarchyMap: RawModelHierarchy;
}

export interface ModelElementDescriptor {
  isOne?: boolean;
  isAbstract?: boolean;
  isBuiltin?: boolean;
  isPrivate?: boolean;
  isMeta?: boolean;
  isEnum?: boolean;
}

export type RawModelType = ModelElementDescriptor & {
  name: string;
};

export type RawModelSet = ModelElementDescriptor & {
  name: string;
  type: string;
};

export type RawModelRelation = ModelElementDescriptor & {
  name: string;
  type: string[];
};

export type RawModelHierarchy = [string, string][];
