export type ListTreeViewMode = 'list' | 'tree'

export function normalizeListTreeViewMode(value: unknown): ListTreeViewMode {
  return value === 'tree' ? 'tree' : 'list'
}
