import type { SourceControlViewMode } from '../../../../../../shared/ui-chrome-types'
import { normalizeListTreeViewMode } from '../../../../../../shared/list-tree-view-mode'

export type CommitDraftsByWorktree = Record<string, string>

export function normalizeSourceControlViewMode(value: unknown): SourceControlViewMode {
  return normalizeListTreeViewMode(value)
}

export function readCommitDraftForWorktree(
  drafts: CommitDraftsByWorktree,
  worktreeId: string | null | undefined
): string {
  return drafts[worktreeId ?? ''] ?? ''
}

export function writeCommitDraftForWorktree(
  drafts: CommitDraftsByWorktree,
  worktreeId: string,
  value: string
): CommitDraftsByWorktree {
  return { ...drafts, [worktreeId]: value }
}
