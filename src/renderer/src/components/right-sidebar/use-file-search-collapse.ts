import { useCallback } from 'react'
import type { FileSearchWorktreeState } from '@/store/slices/editor/types/file-search-worktree-state'
import type { SearchRowProjection } from './search-rows'

export function useFileSearchCollapse({
  projection,
  collapsedFiles,
  collapsedDirectories,
  updateSearchState
}: {
  projection: SearchRowProjection
  collapsedFiles: ReadonlySet<string>
  collapsedDirectories: ReadonlySet<string>
  updateSearchState: (updates: Partial<FileSearchWorktreeState>) => void
}) {
  const toggleDirectory = useCallback(
    (directoryKey: string) => {
      const next = new Set(collapsedDirectories)
      if (next.has(directoryKey)) {
        next.delete(directoryKey)
      } else {
        next.add(directoryKey)
      }
      updateSearchState({ collapsedDirectories: next })
    },
    [collapsedDirectories, updateSearchState]
  )

  const canToggleAll = projection.filePaths.length > 0
  const allCollapsed =
    canToggleAll &&
    projection.directoryKeys.every((key) => collapsedDirectories.has(key)) &&
    projection.filePaths.every((path) => collapsedFiles.has(path))
  const collapseAll = useCallback(() => {
    updateSearchState({
      collapsedDirectories: new Set(projection.directoryKeys),
      collapsedFiles: new Set(projection.filePaths)
    })
  }, [projection.directoryKeys, projection.filePaths, updateSearchState])
  const expandAll = useCallback(() => {
    updateSearchState({ collapsedDirectories: new Set(), collapsedFiles: new Set() })
  }, [updateSearchState])

  return { toggleDirectory, canToggleAll, allCollapsed, collapseAll, expandAll }
}
