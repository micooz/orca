import type { GitStagingArea, GitStatusEntry } from '../../../../shared/git-status-types'
import { compareGitStatusEntries } from './source-control-status-sort'
import {
  buildPathTree,
  compactPathTree,
  flattenPathTree,
  type PathTreeDirectoryNode,
  type PathTreeEntry,
  type PathTreeFileNode,
  type PathTreeNode
} from './path-tree'

export type SourceControlTreeArea = Extract<GitStagingArea, 'unstaged' | 'staged' | 'untracked'>
// Why: committed branch rows share the same path tree but do not carry
// uncommitted status metadata, so the tree builder stays entry-shape generic.
export type SourceControlTreeEntry = PathTreeEntry

export type SourceControlTreeFileNode<
  Entry extends SourceControlTreeEntry = GitStatusEntry,
  Area extends string = SourceControlTreeArea
> = PathTreeFileNode<Entry, { area: Area }>

export type SourceControlTreeDirectoryNode<
  Entry extends SourceControlTreeEntry = GitStatusEntry,
  Area extends string = SourceControlTreeArea
> = PathTreeDirectoryNode<Entry, { area: Area }>

export type SourceControlTreeNode<
  Entry extends SourceControlTreeEntry = GitStatusEntry,
  Area extends string = SourceControlTreeArea
> = PathTreeNode<Entry, { area: Area }>

export function buildSourceControlTree<
  Entry extends SourceControlTreeEntry = GitStatusEntry,
  Area extends string = SourceControlTreeArea
>(
  area: Area,
  entries: Entry[],
  compareEntries?: (a: Entry, b: Entry) => number
): SourceControlTreeNode<Entry, Area>[] {
  return buildPathTree(area, entries, { area }, compareEntries)
}

export function buildGitStatusSourceControlTree(
  area: SourceControlTreeArea,
  entries: GitStatusEntry[]
): SourceControlTreeNode<GitStatusEntry, SourceControlTreeArea>[] {
  // Why: uncommitted trees must preserve the conflict-first ordering used by
  // the flat Source Control list; branch trees can sort by path.
  return buildSourceControlTree(area, entries, compareGitStatusEntries)
}

export function flattenSourceControlTree<Entry extends SourceControlTreeEntry, Area extends string>(
  nodes: readonly SourceControlTreeNode<Entry, Area>[],
  collapsedDirectoryKeys: ReadonlySet<string>
): SourceControlTreeNode<Entry, Area>[] {
  return flattenPathTree(nodes, collapsedDirectoryKeys)
}

export function compactSourceControlTree<Entry extends SourceControlTreeEntry, Area extends string>(
  nodes: SourceControlTreeNode<Entry, Area>[]
): SourceControlTreeNode<Entry, Area>[] {
  return compactPathTree(nodes)
}

export function namespaceSourceControlTreeDirectoryKeys<
  Entry extends SourceControlTreeEntry,
  Area extends string
>(
  nodes: SourceControlTreeNode<Entry, Area>[],
  namespace: string
): SourceControlTreeNode<Entry, Area>[] {
  const namespaceNode = (
    node: SourceControlTreeNode<Entry, Area>
  ): SourceControlTreeNode<Entry, Area> => {
    if (node.type === 'file') {
      return node
    }

    // Why: pinned conflict folders share git area semantics with Changes, but
    // collapse state is UI-section-local and needs a distinct directory key.
    return {
      ...node,
      key: `dir::${namespace}::${node.path}`,
      children: node.children.map(namespaceNode)
    }
  }

  return nodes.map(namespaceNode)
}

export function applyGitStatusEntryAreasToSourceControlTree(
  nodes: SourceControlTreeNode<GitStatusEntry, SourceControlTreeArea>[]
): SourceControlTreeNode<GitStatusEntry, SourceControlTreeArea>[] {
  const applyEntryArea = (
    node: SourceControlTreeNode<GitStatusEntry, SourceControlTreeArea>
  ): SourceControlTreeNode<GitStatusEntry, SourceControlTreeArea> => {
    if (node.type === 'file') {
      return {
        ...node,
        key: `${node.entry.area}::${node.entry.path}`,
        area: node.entry.area
      }
    }

    return {
      ...node,
      children: node.children.map(applyEntryArea)
    }
  }

  return nodes.map(applyEntryArea)
}

export function collectSourceControlTreeFileEntries<
  Entry extends SourceControlTreeEntry,
  Area extends string
>(node: SourceControlTreeNode<Entry, Area>): Entry[] {
  if (node.type === 'file') {
    return [node.entry]
  }

  const entries: Entry[] = []
  const collect = (child: SourceControlTreeNode<Entry, Area>): void => {
    if (child.type === 'file') {
      entries.push(child.entry)
      return
    }
    for (const grandchild of child.children) {
      collect(grandchild)
    }
  }

  for (const child of node.children) {
    collect(child)
  }
  return entries
}
