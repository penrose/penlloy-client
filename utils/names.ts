import { AlloyInstanceAtom } from "../types/AlloyInstance.js";

export const toPenroseTypeName = (typeName: string) => {
  return `_type_${typeName.replaceAll("/", "_SLASH_")}`;
};

export const toPenroseRelationFunctionName = (relName: string) => {
  return `_rel_${relName.replaceAll("$", "_DOLLAR_")}`;
};

export const toPenroseSetFunctionName = (setName: string) => {
  return `_set_${setName.replaceAll("$", "_DOLLAR_")}`;
};

export const toPenroseAtomName = ({ type, index }: AlloyInstanceAtom) => {
  return `_atom_${type.replaceAll("/", "_SLASH_")}_${index}`;
};
