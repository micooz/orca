import { normalizeSearchFileMatchCount } from '../../../../shared/search-match-count'
import type {
  SearchFileResult,
  SearchMatch,
  SearchResult
} from '../../../../shared/code-search-types'
import type { FileSearchViewMode } from '../../../../shared/ui-chrome-types'
import { buildPathTree, compactPathTree, type PathTreeNode } from './path-tree'

type SearchTreeEntry = SearchFileResult & { path: string }

export type SearchRow =
  | {
      type: 'directory'
      key: string
      name: string
      path: string
      depth: number
      matchCount: number
      collapsed: boolean
    }
  | {
      type: 'file'
      fileResult: SearchFileResult
      collapsed: boolean
      depth: number
      showParentPath: boolean
    }
  | {
      type: 'match'
      fileResult: SearchFileResult
      match: SearchMatch
      matchIndex: number
      depth: number
    }

export type SearchRowProjection = {
  rows: SearchRow[]
  directoryKeys: string[]
  filePaths: string[]
}

function appendFileRows(
  rows: SearchRow[],
  fileResult: SearchFileResult,
  depth: number,
  showParentPath: boolean,
  collapsedFiles: ReadonlySet<string>
): void {
  const collapsed = collapsedFiles.has(fileResult.filePath)
  rows.push({ type: 'file', fileResult, collapsed, depth, showParentPath })
  if (collapsed) {
    return
  }

  for (const [matchIndex, match] of fileResult.matches.entries()) {
    rows.push({
      type: 'match',
      fileResult,
      match,
      matchIndex,
      depth: showParentPath ? 0 : depth + 1
    })
  }
}

function getDirectoryMatchCount(node: PathTreeNode<SearchTreeEntry>): number {
  if (node.type === 'file') {
    return normalizeSearchFileMatchCount(node.entry)
  }
  return node.children.reduce((count, child) => count + getDirectoryMatchCount(child), 0)
}

function buildTreeProjection(
  results: SearchResult,
  collapsedFiles: ReadonlySet<string>,
  collapsedDirectories: ReadonlySet<string>
): SearchRowProjection {
  const entries = results.files.map((fileResult) => ({
    ...fileResult,
    path: fileResult.relativePath
  }))
  const tree = compactPathTree(buildPathTree('search', entries, {}))
  const rows: SearchRow[] = []
  const directoryKeys: string[] = []

  const collectDirectoryKeys = (node: PathTreeNode<SearchTreeEntry>): void => {
    if (node.type === 'file') {
      return
    }
    directoryKeys.push(node.key)
    node.children.forEach(collectDirectoryKeys)
  }
  tree.forEach(collectDirectoryKeys)

  const visit = (node: PathTreeNode<SearchTreeEntry>): void => {
    if (node.type === 'file') {
      appendFileRows(rows, node.entry, node.depth, false, collapsedFiles)
      return
    }

    const collapsed = collapsedDirectories.has(node.key)
    rows.push({
      type: 'directory',
      key: node.key,
      name: node.name,
      path: node.path,
      depth: node.depth,
      matchCount: getDirectoryMatchCount(node),
      collapsed
    })
    if (!collapsed) {
      node.children.forEach(visit)
    }
  }

  tree.forEach(visit)
  return { rows, directoryKeys, filePaths: results.files.map((file) => file.filePath) }
}

export function buildSearchRowProjection(
  results: SearchResult | null,
  viewMode: FileSearchViewMode,
  collapsedFiles: ReadonlySet<string>,
  collapsedDirectories: ReadonlySet<string>
): SearchRowProjection {
  if (!results) {
    return { rows: [], directoryKeys: [], filePaths: [] }
  }
  if (viewMode === 'tree') {
    return buildTreeProjection(results, collapsedFiles, collapsedDirectories)
  }

  const rows: SearchRow[] = []
  for (const fileResult of results.files) {
    appendFileRows(rows, fileResult, 0, true, collapsedFiles)
  }
  return { rows, directoryKeys: [], filePaths: results.files.map((file) => file.filePath) }
}

export function buildSearchRows(
  results: SearchResult | null,
  collapsedFiles: ReadonlySet<string>
): SearchRow[] {
  return buildSearchRowProjection(results, 'list', collapsedFiles, new Set()).rows
}
