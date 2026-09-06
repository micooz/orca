import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../listing/content-status', () => ({
  SourceControlContentStatus: () => <div data-testid="status" />,
  SourceControlNoChanges: () => <div data-testid="no-changes" />,
  SourceControlNoMatchingFiles: () => <div data-testid="no-matches" />
}))

vi.mock('./commit-surface', () => ({
  SourceControlCommitSurface: () => <div data-testid="commit-surface" />
}))

vi.mock('./fork-push-notice', () => ({
  SourceControlForkPushNotice: () => null
}))

import { SourceControlPanelContent } from './panel-content'

function renderPanel(normalizedFilter = ''): string {
  return renderToStaticMarkup(
    <SourceControlPanelContent
      {...({
        activeRepo: { id: 'repo-1' },
        activeWorktree: { pushTarget: null },
        currentWorktreeId: 'worktree-1',
        worktreePath: '/repo',
        model: {
          branchEntries: [],
          branchSummary: { status: 'ready', baseRef: 'main' },
          collapsedSections: new Set(),
          conflictOperation: 'unknown',
          displaySections: [],
          fileFilterState: { tooLarge: false },
          filterQuery: normalizedFilter,
          filteredBranchEntries: [],
          filteredGrouped: { staged: [], unstaged: [], untracked: [] },
          hasUncommittedEntries: false,
          isGitHistoryVisible: false,
          normalizedFilter,
          showCommittedChanges: false,
          unresolvedConflictReviewEntries: [],
          unresolvedConflicts: []
        }
      } as unknown as React.ComponentProps<typeof SourceControlPanelContent>)}
    />
  )
}

describe('SourceControlPanelContent empty-state order', () => {
  it('renders the clean-branch state below the commit surface', () => {
    const markup = renderPanel()

    expect(markup.indexOf('data-testid="commit-surface"')).toBeLessThan(
      markup.indexOf('data-testid="no-changes"')
    )
  })

  it('renders the no-matches state below the commit surface', () => {
    const markup = renderPanel('missing')

    expect(markup.indexOf('data-testid="commit-surface"')).toBeLessThan(
      markup.indexOf('data-testid="no-matches"')
    )
  })
})
