import { AlloyInstanceAtom } from "../types/AlloyInstance.js";

export const toPenroseTypeName = (typeName: string) => {
  if (typeName.startsWith("PENROSE")) {
    return typeName.substring(7);
  } else {
    return `_type_${typeName
      .replaceAll("$", "_DOLLAR_")
      .replaceAll("/", "_SLASH_")
      .replaceAll("'", "_PRIME_")}`;
  }
};

export const toPenroseRelationFunctionName = (relName: string) => {
  return `_rel_${relName
    .replaceAll("$", "_DOLLAR_")
    .replaceAll("/", "_SLASH_")
    .replaceAll("'", "_PRIME_")}`;
};

export const toPenroseSetFunctionName = (setName: string) => {
  return `_set_${setName
    .replaceAll("$", "_DOLLAR_")
    .replaceAll("/", "_SLASH_")
    .replaceAll("'", "_PRIME_")}`;
};

export const toPenroseAtomName = (atom: AlloyInstanceAtom) => {
  if (atom.tag === "Number") {
    return atom.contents.toString();
  } else if (atom.tag === "String") {
    console.warn("Not supported yet");
    return "";
  } else {
    const { type, index } = atom;
    return `_atom_${type
      .replaceAll("$", "_DOLLAR_")
      .replaceAll("/", "_SLASH_")
      .replaceAll("'", "_PRIME_")}_${index}`;
  }
};
