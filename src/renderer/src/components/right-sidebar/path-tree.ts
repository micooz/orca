import { normalizeRelativePath } from '@/lib/path'
import { compareFileNames } from '../../../../shared/file-name-sort'

export type PathTreeEntry = { path: string }

export type PathTreeFileNode<
  Entry extends PathTreeEntry,
  Metadata extends object = Record<never, never>
> = {
  type: 'file'
  key: string
  name: string
  path: string
  entry: Entry
  depth: number
} & Metadata

export type PathTreeDirectoryNode<
  Entry extends PathTreeEntry,
  Metadata extends object = Record<never, never>
> = {
  type: 'directory'
  key: string
  name: string
  path: string
  depth: number
  fileCount: number
  children: PathTreeNode<Entry, Metadata>[]
} & Metadata

export type PathTreeNode<
  Entry extends PathTreeEntry,
  Metadata extends object = Record<never, never>
> = PathTreeFileNode<Entry, Metadata> | PathTreeDirectoryNode<Entry, Metadata>

type MutableDirectoryNode<Entry extends PathTreeEntry, Metadata extends object> = Omit<
  PathTreeDirectoryNode<Entry, Metadata>,
  'children'
> & {
  children: PathTreeNode<Entry, Metadata>[]
  directoryChildren: Map<string, MutableDirectoryNode<Entry, Metadata>>
}

function makeDirectoryNode<Entry extends PathTreeEntry, Metadata extends object>(
  namespace: string,
  path: string,
  name: string,
  depth: number,
  metadata: Metadata
): MutableDirectoryNode<Entry, Metadata> {
  return {
    type: 'directory',
    key: `dir::${namespace}::${path}`,
    name,
    path,
    depth,
    fileCount: 0,
    children: [],
    directoryChildren: new Map(),
    ...metadata
  }
}

function finalizeDirectoryNode<Entry extends PathTreeEntry, Metadata extends object>(
  node: MutableDirectoryNode<Entry, Metadata>,
  compareEntries: (a: Entry, b: Entry) => number
): PathTreeDirectoryNode<Entry, Metadata> {
  const directories: PathTreeDirectoryNode<Entry, Metadata>[] = []
  const files: PathTreeFileNode<Entry, Metadata>[] = []

  for (const child of node.children) {
    if (child.type === 'directory') {
      directories.push(
        finalizeDirectoryNode(child as MutableDirectoryNode<Entry, Metadata>, compareEntries)
      )
    } else {
      files.push(child)
    }
  }

  directories.sort((left, right) => compareFileNames(left.name, right.name))
  files.sort((left, right) => compareEntries(left.entry, right.entry))
  const fileCount =
    files.length + directories.reduce((count, directory) => count + directory.fileCount, 0)
  const { directoryChildren: _directoryChildren, ...finalized } = node
  return {
    ...finalized,
    fileCount,
    children: [...directories, ...files]
  } as PathTreeDirectoryNode<Entry, Metadata>
}

export function splitPathSegments(path: string): string[] {
  return path.split(/[\\/]+/).filter(Boolean)
}

export function buildPathTree<
  Entry extends PathTreeEntry,
  Metadata extends object = Record<never, never>
>(
  namespace: string,
  entries: Entry[],
  metadata: Metadata,
  compareEntries: (a: Entry, b: Entry) => number = (left, right) =>
    compareFileNames(left.path, right.path)
): PathTreeNode<Entry, Metadata>[] {
  const root = makeDirectoryNode<Entry, Metadata>(namespace, '', '', -1, metadata)

  for (const entry of entries) {
    const normalizedPath = normalizeRelativePath(entry.path)
    const segments = splitPathSegments(normalizedPath)
    if (segments.length === 0) {
      continue
    }

    let parent = root
    // Why: accumulating avoids repeatedly copying the same ancestor segments.
    let ancestorPath = ''
    for (let index = 0; index < segments.length - 1; index += 1) {
      const name = segments[index]
      ancestorPath = ancestorPath ? `${ancestorPath}/${name}` : name
      let directory = parent.directoryChildren.get(name)
      if (!directory) {
        directory = makeDirectoryNode(namespace, ancestorPath, name, index, metadata)
        parent.directoryChildren.set(name, directory)
        parent.children.push(directory)
      }
      parent = directory
    }

    parent.children.push({
      type: 'file',
      key: `${namespace}::${entry.path}`,
      name: segments.at(-1)!,
      path: normalizedPath,
      entry,
      depth: segments.length - 1,
      ...metadata
    })
  }

  return finalizeDirectoryNode(root, compareEntries).children
}

export function flattenPathTree<Entry extends PathTreeEntry, Metadata extends object>(
  nodes: readonly PathTreeNode<Entry, Metadata>[],
  collapsedDirectoryKeys: ReadonlySet<string>
): PathTreeNode<Entry, Metadata>[] {
  const rows: PathTreeNode<Entry, Metadata>[] = []
  const visit = (node: PathTreeNode<Entry, Metadata>): void => {
    rows.push(node)
    if (node.type === 'directory' && !collapsedDirectoryKeys.has(node.key)) {
      node.children.forEach(visit)
    }
  }
  nodes.forEach(visit)
  return rows
}

export function compactPathTree<Entry extends PathTreeEntry, Metadata extends object>(
  nodes: PathTreeNode<Entry, Metadata>[]
): PathTreeNode<Entry, Metadata>[] {
  const compactNode = (
    node: PathTreeNode<Entry, Metadata>,
    depth: number
  ): PathTreeNode<Entry, Metadata> => {
    if (node.type === 'file') {
      return { ...node, depth }
    }

    const names = [node.name]
    let compacted = node
    while (compacted.children.length === 1 && compacted.children[0]?.type === 'directory') {
      compacted = compacted.children[0]
      names.push(compacted.name)
    }
    return {
      ...compacted,
      name: names.join('/'),
      depth,
      children: compacted.children.map((child) => compactNode(child, depth + 1))
    }
  }
  return nodes.map((node) => compactNode(node, 0))
}
