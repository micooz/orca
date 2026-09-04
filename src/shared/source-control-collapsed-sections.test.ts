import { describe, expect, it } from 'vitest'
import { normalizeSourceControlCollapsedSectionsByWorktree } from './source-control-collapsed-sections'

describe('normalizeSourceControlCollapsedSectionsByWorktree', () => {
  it('keeps per-worktree valid sections and removes invalid or duplicate values', () => {
    expect(
      normalizeSourceControlCollapsedSectionsByWorktree({
        w1: ['history', 'branch', 'history', 'unknown'],
        w2: [],
        invalid: 'history'
      })
    ).toEqual({ w1: ['history', 'branch'], w2: [] })
  })
})
