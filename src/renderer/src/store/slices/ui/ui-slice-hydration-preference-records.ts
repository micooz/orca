import type { PersistedUIState } from '../../../../../shared/persisted-ui-state-types'
import type { UISlice } from './ui-slice-contract'
import {
  sanitizeShowDotfilesByWorktree,
  sanitizeSourceControlCollapsedSectionsByWorktree,
  normalizeSourceControlCollapsedTreeDirsByWorktree
} from './ui-slice-hydration-sanitizers'

type HydratedPreferenceRecords = Pick<
  UISlice,
  | 'showDotfilesByWorktree'
  | 'sourceControlCollapsedSectionsByWorktree'
  | 'sourceControlCollapsedTreeDirsByWorktree'
>

export function hydrateUIPreferenceRecords(ui: PersistedUIState): HydratedPreferenceRecords {
  return {
    showDotfilesByWorktree: sanitizeShowDotfilesByWorktree(ui.showDotfilesByWorktree),
    sourceControlCollapsedSectionsByWorktree: sanitizeSourceControlCollapsedSectionsByWorktree(
      ui.sourceControlCollapsedSectionsByWorktree
    ),
    sourceControlCollapsedTreeDirsByWorktree: normalizeSourceControlCollapsedTreeDirsByWorktree(
      ui.sourceControlCollapsedTreeDirsByWorktree
    )
  }
}
