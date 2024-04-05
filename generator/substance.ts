import {
  AlloyInstance,
  AlloyInstanceAtom,
  AlloyInstanceType,
} from "../types/AlloyInstance.js";
import { AlloyModel } from "../types/AlloyModel.js";
import {
  RawInstance,
  RawInstanceAtom,
  RawInstanceRelation,
  RawInstanceSet,
  RawInstanceType,
} from "../types/RawAlloyInstance.js";
import {
  toPenroseAtomName,
  toPenroseRelationFunctionName,
  toPenroseSetFunctionName,
  toPenroseTypeName,
} from "../utils/names.js";

const ignoredTypes = new Set(["Int", "seq/Int"]);

const toAtomUniqueName = ({ type, index }: RawInstanceAtom): string => {
  return `${type}:${index}`;
};

export const compileInstance = (
  instance: RawInstance,
  model: AlloyModel
): AlloyInstance => {
  const hierarchyOrder = model.hierarchyGraph.topsort();

  const rawTypes: RawInstanceType[] = instance.types
    .filter((t) => !ignoredTypes.has(t.name))
    .map((t) => ({
      name: t.name,
      atoms: t.atoms.filter((a) => !ignoredTypes.has(a.type)),
    }));

  const nameAtomMap: Map<string, AlloyInstanceAtom> = new Map(
    rawTypes.flatMap((t) => t.atoms).map((a) => [toAtomUniqueName(a), a])
  );

  // Make sure that all equivalent atoms in the types, sets, and relations
  // refer to the same Atom object.
  const types: RawInstanceType[] = rawTypes.map((t) => ({
    name: t.name,
    atoms: t.atoms.map((a) => nameAtomMap.get(toAtomUniqueName(a))!),
  }));

  const sets: RawInstanceSet[] = instance.sets.map((s) => ({
    name: s.name,
    atoms: s.atoms
      .filter((a) => !ignoredTypes.has(a.type))
      .map((a) => nameAtomMap.get(toAtomUniqueName(a))!),
  }));

  const relations: RawInstanceRelation[] = instance.relations.map((r) => ({
    name: r.name,
    tuples: r.tuples
      .filter((t) => t.every((a) => !ignoredTypes.has(a.type)))
      .map((t) => t.map((a) => nameAtomMap.get(toAtomUniqueName(a))!)),
  }));

  // ===================================
  // The part below is to make sure that an atom is member of only one sig
  // notwithstanding the fact that it may be a member of multiple sigs in the Alloy model
  // due to subtyping. This is done by finding the smallest type in the hierarchy that the atom.

  const atomTypesMap: Map<AlloyInstanceAtom, string[]> = new Map();

  for (const type of rawTypes) {
    for (const atom of type.atoms) {
      const retrieved = atomTypesMap.get(atom);
      if (retrieved === undefined) {
        atomTypesMap.set(atom, [type.name]);
      } else {
        retrieved.push(type.name);
      }
    }
  }

  const atomTypeMap: Map<AlloyInstanceAtom, string> = new Map();
  for (const [a, ts] of atomTypesMap) {
    const hierarchyPositions = ts.map((t) => hierarchyOrder.indexOf(t));
    const minHierarchyPosition = Math.min(...hierarchyPositions);
    const minType = hierarchyOrder[minHierarchyPosition];
    atomTypeMap.set(a, minType);
  }

  const typeAtomsMap: Map<string, AlloyInstanceAtom[]> = new Map();
  for (const [a, t] of atomTypeMap) {
    const retrieved = typeAtomsMap.get(t);
    if (retrieved === undefined) {
      typeAtomsMap.set(t, [a]);
    } else {
      retrieved.push(a);
    }
  }

  const finalTypes: AlloyInstanceType[] = [...typeAtomsMap.entries()].map(
    ([t, as]) => ({
      name: t,
      atoms: as,
    })
  );

  return {
    types: finalTypes,
    sets,
    relations,
  };
};

const toAtomDisplayName = (atom: AlloyInstanceAtom): string =>
  `${atom.type}_${atom.index}`;

export const translateToSubstance = (instance: AlloyInstance) => {
  const prog: string[] = [];

  for (const t of instance.types) {
    const typeName = toPenroseTypeName(t.name);
    const atomNames = t.atoms.map(toPenroseAtomName);

    const line = `${typeName} ${atomNames.join(", ")}`;
    prog.push(line);
  }

  let sIndex = 0;
  for (const s of instance.sets) {
    const setFunctionName = toPenroseSetFunctionName(s.name);
    const atomNames = s.atoms.map(toPenroseAtomName);
    for (const atomName of atomNames) {
      const line = `Set s${sIndex} := ${setFunctionName}(${atomName})`;
      prog.push(line);
      sIndex += 1;
    }
  }

  let rIndex = 0;
  for (const r of instance.relations) {
    const relFunctionName = toPenroseRelationFunctionName(r.name);
    for (const tuple of r.tuples) {
      const atomNames = tuple.map(toPenroseAtomName);
      const line = `Rel r${rIndex} := ${relFunctionName}(${atomNames.join(
        ", "
      )})`;
      prog.push(line);
      rIndex += 1;
    }
  }

  for (const t of instance.types) {
    for (const a of t.atoms) {
      const line = `Label ${toPenroseAtomName(a)} \"${toAtomDisplayName(a)}\"`;
      prog.push(line);
    }
  }

  return prog.join("\n");
};
