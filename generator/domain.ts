import {
  AlloyModel,
  AlloyModelRelation,
  AlloyModelSet,
  AlloyModelType,
} from "../types/AlloyModel.js";
import {
  DomainMultipleType,
  DomainRel,
  DomainSet,
  DomainSingleType,
  DomainSubType,
  DomainType,
} from "../types/DomainElement.js";
import { ModelElementDescriptor, RawModel } from "../types/RawAlloyModel.js";
import Graph from "../utils/Graph.js";
import {
  toPenroseRelationFunctionName,
  toPenroseSetFunctionName,
  toPenroseTypeName,
} from "../utils/names.js";

export type TranslatedDomainStructure = {
  types: DomainType[];
  subtypes: DomainSubType[];
  sets: DomainSet[];
  rels: DomainRel[];
};

export const compileModel = (rawModel: RawModel): AlloyModel => {
  const { types, sets, relations, hierarchyMap } = rawModel;

  const typeMap: Map<string, AlloyModelType> = new Map(
    types.map((t) => [t.name, t])
  );

  const setMap: Map<string, AlloyModelSet> = new Map();
  // For `sig X in A + B {}`, Alloy makes two sets, one with parent `A` and one with parent `B`.
  // We combine them back into one set.
  for (const set of sets) {
    const retrieved = setMap.get(set.name);
    if (retrieved !== undefined) {
      retrieved.types.push(set.type);
    } else {
      const { type, ...exceptType } = set;
      setMap.set(set.name, { ...exceptType, types: [type] });
    }
  }

  const relationMap: Map<string, AlloyModelRelation> = new Map();
  // Similarly for relations.
  for (const rel of relations) {
    const key = `${rel.name}`;
    const retrieved = relationMap.get(key);
    if (retrieved !== undefined) {
      retrieved.types.push(rel.type);
    } else {
      const { type, ...exceptType } = rel;
      relationMap.set(key, { ...exceptType, types: [type] });
    }
  }

  const hierarchyGraph: Graph<string> = new Graph();
  for (const t of types) {
    hierarchyGraph.setNode(t.name, undefined);
  }

  for (const [sub, sup] of hierarchyMap) {
    hierarchyGraph.setEdge({ i: sub, j: sup, e: undefined });
  }

  return {
    topLevelSigs: typeMap,
    sets: setMap,
    relations: relationMap,
    hierarchyMap: rawModel.hierarchyMap,
    hierarchyGraph: hierarchyGraph,
  };
};

const emptyDomainStructure = (): TranslatedDomainStructure => ({
  types: [],
  subtypes: [],
  sets: [],
  rels: [],
});

const isDomainLiteralType = (t: string) => {
  return t === "PENROSENumber" || t === "PENROSEString";
};

export const translateToDomain = (model: AlloyModel) => {
  const initRes = emptyDomainStructure();

  const addResult = (
    prev: TranslatedDomainStructure,
    curr: TranslatedDomainStructure
  ) => {
    return {
      types: [...prev.types, ...curr.types],
      subtypes: [...prev.subtypes, ...curr.subtypes],
      sets: [...prev.sets, ...curr.sets],
      rels: [...prev.rels, ...curr.rels],
    };
  };

  const afterTypes = [...model.topLevelSigs.values()].reduce(
    (acc, type) => addResult(acc, processType(type)),
    initRes
  );

  const afterSets = [...model.sets.values()].reduce(
    (acc, set) => addResult(acc, processSet(set)),
    afterTypes
  );

  const afterRels = [...model.relations.values()].reduce(
    (acc, rel) => addResult(acc, processRel(rel)),
    afterSets
  );

  const afterHierarchy = addResult(
    afterRels,
    processHierarchyMap(model.hierarchyMap)
  );

  return constructDomain(afterHierarchy);
};

const toDomainName = (name: DomainType) => {
  if (name.tag === "DomainSingleType") {
    return toPenroseTypeName(name.contents);
  } else {
    return `_conj_${name.contents
      .map((n) => n.replaceAll("/", "_SLASH_"))
      .join("_OR_")}`;
  }
};

const writeDomainDescriptors = (
  originalLine: string,
  desc: ModelElementDescriptor
) => {
  const words: string[] = [];
  if (desc.isAbstract === true) words.push("abstract");
  if (desc.isBuiltin === true) words.push("builtin");
  if (desc.isEnum === true) words.push("enum");
  if (desc.isMeta === true) words.push("meta");
  if (desc.isOne === true) words.push("one");
  if (desc.isPrivate === true) words.push("private");

  return words.length === 0
    ? originalLine
    : `${originalLine} -- ${words.join(" ")}`;
};

const constructDomain = ({
  types,
  subtypes,
  sets,
  rels,
}: TranslatedDomainStructure): string => {
  const prog: string[] = ["type Rel", "type Set", "Set <: Rel"];

  for (const t of types) {
    const lineWithoutDescriptor = `type ${toDomainName(t)}`;
    const line = writeDomainDescriptors(lineWithoutDescriptor, t);
    if (!prog.includes(line)) {
      prog.push(line);
    }
  }

  for (const st of subtypes) {
    const { sub, sup } = st;
    const line = `${toDomainName(sub)} <: ${toDomainName(sup)}`;
    if (!prog.includes(line)) {
      prog.push(line);
    }
  }

  for (const s of sets) {
    const { name, type } = s;
    const lineWithoutDescriptor = `function ${toPenroseSetFunctionName(
      name
    )} (${toDomainName(type)}) -> Set`;
    const line = writeDomainDescriptors(lineWithoutDescriptor, s);
    if (!prog.includes(line)) {
      prog.push(line);
    }
  }

  for (const rel of rels) {
    const { name, types: argTypes } = rel;
    const lineWithoutDescriptor = `function ${toPenroseRelationFunctionName(
      name
    )} (${argTypes.map(toDomainName).join(", ")}) -> Rel`;
    const line = writeDomainDescriptors(lineWithoutDescriptor, rel);
    if (!prog.includes(line)) {
      prog.push(line);
    }
  }

  return prog.join("\n");
};

const processSingleName = (raw: string): DomainSingleType => {
  return {
    tag: "DomainSingleType",
    contents: alloyTypeDomainTypeMap(raw),
  };
};

const copyModelElementDescriptor = (
  x: ModelElementDescriptor
): ModelElementDescriptor => {
  return {
    isOne: x.isOne,
    isAbstract: x.isAbstract,
    isBuiltin: x.isBuiltin,
    isPrivate: x.isPrivate,
    isMeta: x.isMeta,
    isEnum: x.isEnum,
  };
};

const processType = (type: AlloyModelType): TranslatedDomainStructure => {
  const { name } = type;

  const result = emptyDomainStructure();

  const domainType = processSingleName(name);
  addSingleType(result, domainType);

  return result;
};

const addSingleType = (
  result: TranslatedDomainStructure,
  singleType: DomainSingleType
) => {
  const type = singleType.contents;
  if (isDomainLiteralType(type)) {
    // ignore, these types should never be declared in Domain
  } else {
    result.types.push(singleType);
  }
};

const addTypeAndNecessarySubtypes = (
  result: TranslatedDomainStructure,
  domainType: DomainType
) => {
  if (domainType.tag === "DomainSingleType") {
    addSingleType(result, domainType);
  } else {
    result.types.push(domainType);
    for (const singleType of domainType.contents) {
      result.subtypes.push({
        tag: "DomainSubType",
        sub: { tag: "DomainSingleType", contents: singleType },
        sup: domainType,
      });
    }
  }
};

const processSet = (set: AlloyModelSet): TranslatedDomainStructure => {
  const { name, types } = set;

  const result = emptyDomainStructure();

  // `sig X in Y + Z {}`
  // type is [Y, Z]

  const domainType = alloyTypeToDomainType(types);

  addTypeAndNecessarySubtypes(result, domainType);

  result.sets.push({
    tag: "DomainSet",
    name,
    type: domainType,
    ...copyModelElementDescriptor(set),
  });

  return result;
};

const processRel = (rel: AlloyModelRelation): TranslatedDomainStructure => {
  const { name, types } = rel;

  const result = emptyDomainStructure();

  const realType = processRelType(types);

  for (const t of realType) {
    addTypeAndNecessarySubtypes(result, t);
  }

  result.rels.push({
    tag: "DomainRel",
    name,
    types: realType,
    ...copyModelElementDescriptor(rel),
  });

  return result;
};

const processHierarchyMap = (hierarchyMap: [string, string][]) => {
  const result = emptyDomainStructure();
  for (const [sub, sup] of hierarchyMap) {
    const domSub = processSingleName(sub);
    const domSup = processSingleName(sup);

    if (
      isDomainLiteralType(domSub.contents) ||
      isDomainLiteralType(domSup.contents)
    ) {
      continue;
    }

    result.subtypes.push({
      tag: "DomainSubType",
      sub: processSingleName(sub),
      sup: processSingleName(sup),
    });
  }
  return result;
};

const alloyTypeDomainTypeMap = (t: string) => {
  if (t === "Int" || t === "seq/Int") {
    return "PENROSENumber";
  } else if (t === "String") {
    return "PENROSEString";
  } else {
    return t;
  }
};
/**
 * Convert a (list of) Alloy type into a Penrose Domain type.
 * @param names a list of Alloy types. If there are more than one, this represents the union of multiple types.
 */
const alloyTypeToDomainType = (names: string[]): DomainType => {
  const ns = new Set(names);
  const sorted = Array.from(ns).sort().map(alloyTypeDomainTypeMap);

  if (sorted.length === 1) {
    return {
      tag: "DomainSingleType",
      contents: sorted[0],
    };
  } else {
    return {
      tag: "DomainMultipleType",
      contents: sorted,
    };
  }
};

const processRelType = (types: string[][]) => {
  const transposed = types[0].map((_, colIndex) =>
    types.map((row) => row[colIndex])
  );
  return transposed.map(alloyTypeToDomainType);
};
