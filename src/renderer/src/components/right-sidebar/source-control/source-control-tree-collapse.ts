import type { SourceControlViewMode } from '../../../../../shared/ui-chrome-types'

export type SourceControlTreeCollapseAction = 'collapse' | 'expand'

export function getSourceControlTreeCollapseControl(
  viewMode: SourceControlViewMode,
  directoryKeys: readonly string[],
  collapsedDirectoryKeys: ReadonlySet<string>
): { action: SourceControlTreeCollapseAction; enabled: boolean } {
  const enabled = viewMode === 'tree' && directoryKeys.length > 0
  const allCollapsed = enabled && directoryKeys.every((key) => collapsedDirectoryKeys.has(key))
  return { action: allCollapsed ? 'expand' : 'collapse', enabled }
}

export function collapseSourceControlTreeDirectories(
  collapsedDirectoryKeys: ReadonlySet<string>,
  directoryKeys: readonly string[]
): Set<string> {
  return new Set([...collapsedDirectoryKeys, ...directoryKeys])
}

export function expandSourceControlTreeDirectories(
  collapsedDirectoryKeys: ReadonlySet<string>,
  directoryKeys: readonly string[]
): Set<string> {
  const next = new Set(collapsedDirectoryKeys)
  directoryKeys.forEach((key) => next.delete(key))
  return next
}
