import { AlloyInstanceAtom } from "../types/AlloyInstance.js";
import { RawInstanceAtom } from "../types/RawAlloyInstance.js";

export const toPenroseTypeName = (typeName: string) => {
  return `_type_${typeName.replaceAll("/", "_SLASH_")}`;
};

export const toPenroseRelationFunctionName = (relName: string) => {
  return `_rel_${relName}`;
};

export const toPenroseSetFunctionName = (setName: string) => {
  return `_set_${setName}`;
};

export const toPenroseAtomName = ({ type, index }: AlloyInstanceAtom) => {
  return `_obj_${type.replaceAll("/", "_SLASH_")}_${index}`;
};
