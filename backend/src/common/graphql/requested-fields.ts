import {
  Kind,
  type FieldNode,
  type GraphQLResolveInfo,
  type SelectionNode,
} from 'graphql';

export type FieldTree = { [key: string]: FieldTree };

export function requestedFields(
  info: GraphQLResolveInfo,
  fieldNode: FieldNode = info.fieldNodes[0],
): FieldTree {
  return selectionsToTree(fieldNode.selectionSet?.selections ?? [], info);
}

function selectionsToTree(
  selections: readonly SelectionNode[],
  info: GraphQLResolveInfo,
): FieldTree {
  const tree: FieldTree = {};

  for (const selection of selections) {
    if (selection.kind === Kind.FIELD) {
      if (selection.name.value.startsWith('__')) {
        continue;
      }
      tree[selection.name.value] = selectionsToTree(
        selection.selectionSet?.selections ?? [],
        info,
      );
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      Object.assign(
        tree,
        selectionsToTree(selection.selectionSet.selections, info),
      );
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = info.fragments[selection.name.value];
      if (fragment) {
        Object.assign(
          tree,
          selectionsToTree(fragment.selectionSet.selections, info),
        );
      }
    }
  }

  return tree;
}

export function isRequested(tree: FieldTree, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(tree, key);
}
