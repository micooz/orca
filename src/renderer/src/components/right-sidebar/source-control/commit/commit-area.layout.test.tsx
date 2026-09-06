import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./commit-message-composer', () => ({
  CommitMessageComposer: () => <div data-testid="composer" />
}))

vi.mock('./commit-action-menu', () => ({
  CommitActionMenu: () => <div data-testid="actions" />
}))

vi.mock('./commit-notices', () => ({
  CommitNotices: () => null
}))

import { CommitArea } from './commit-area'

function renderCommitArea(showComposer: boolean): string {
  return renderToStaticMarkup(
    <CommitArea
      {...({
        commitMessage: '',
        commitError: null,
        pushRecovery: null,
        remoteActionError: null,
        createPrIntentNotice: null,
        generateError: null,
        stagedCount: 0,
        primaryAction: { kind: 'commit' },
        dropdownItems: [],
        showComposer
      } as unknown as React.ComponentProps<typeof CommitArea>)}
    />
  )
}

describe('CommitArea layout', () => {
  it('adds top padding when the composer is hidden', () => {
    expect(renderCommitArea(false)).toContain('px-3 pb-2 pt-2')
  })

  it('keeps the existing spacing when the composer is visible', () => {
    expect(renderCommitArea(true)).toContain('class="px-3 pb-2"')
  })
})
