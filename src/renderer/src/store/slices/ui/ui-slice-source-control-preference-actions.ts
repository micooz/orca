import { normalizeSourceControlCollapsedSections } from '../../../../../shared/source-control-collapsed-sections'
import type { UISlice, UISliceSet } from './ui-slice-contract'

export function createSourceControlPreferenceActions(set: UISliceSet): Partial<UISlice> {
  return {
    sourceControlCollapsedSectionsByWorktree: {},
    setSourceControlCollapsedSectionsForWorktree: (worktreeId, sections) =>
      set((s) => {
        if (!worktreeId) {
          return s
        }
        return {
          sourceControlCollapsedSectionsByWorktree: {
            ...s.sourceControlCollapsedSectionsByWorktree,
            [worktreeId]: normalizeSourceControlCollapsedSections(sections)
          }
        }
      }),

    sourceControlCollapsedTreeDirsByWorktree: {},
    setSourceControlCollapsedTreeDirsForWorktree: (worktreeId, dirs) =>
      set((s) =>
        worktreeId
          ? {
              sourceControlCollapsedTreeDirsByWorktree: {
                ...s.sourceControlCollapsedTreeDirsByWorktree,
                [worktreeId]: [...new Set(dirs)]
              }
            }
          : s
      )
  }
}
