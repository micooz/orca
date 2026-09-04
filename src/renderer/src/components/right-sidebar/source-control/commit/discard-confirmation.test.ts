import { describe, expect, it } from 'vitest'
import { getDiscardAreaConfirmationCopy } from './discard-confirmation'

describe('getDiscardAreaConfirmationCopy', () => {
  it('warns that a mixed Changes discard permanently deletes untracked files', () => {
    const copy = getDiscardAreaConfirmationCopy('unstaged', 2, true)

    expect(copy.title).toContain('delete untracked files')
    expect(copy.description).toContain('permanently delete untracked files')
  })
})
