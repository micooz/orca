import type { PersistedUIState } from '../../../../../shared/persisted-ui-state-types'
import type { UISlice } from './ui-slice-contract'
import {
  sanitizeShowDotfilesByWorktree,
  sanitizeSourceControlCollapsedSectionsByWorktree
} from './ui-slice-hydration-sanitizers'

type HydratedPreferenceRecords = Pick<
  UISlice,
  'showDotfilesByWorktree' | 'sourceControlCollapsedSectionsByWorktree'
>

export function hydrateUIPreferenceRecords(ui: PersistedUIState): HydratedPreferenceRecords {
  return {
    showDotfilesByWorktree: sanitizeShowDotfilesByWorktree(ui.showDotfilesByWorktree),
    sourceControlCollapsedSectionsByWorktree: sanitizeSourceControlCollapsedSectionsByWorktree(
      ui.sourceControlCollapsedSectionsByWorktree
    )
  }
}
