import { describe, expect, it } from 'vitest'
import {
  normalizeSourceControlCollapsedSectionsByWorktree,
  normalizeSourceControlCollapsedTreeDirsByWorktree
} from './source-control-collapsed-sections'

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

describe('normalizeSourceControlCollapsedTreeDirsByWorktree', () => {
  it('keeps unique directory keys per safe worktree id', () => {
    expect(
      normalizeSourceControlCollapsedTreeDirsByWorktree({
        w1: ['staged:src', 'staged:src', 'branch:docs'],
        w2: [],
        invalid: 'staged:src',
        constructor: ['branch:unsafe']
      })
    ).toEqual({ w1: ['staged:src', 'branch:docs'], w2: [] })
  })

  it('returns an empty record for non-record input', () => {
    expect(normalizeSourceControlCollapsedTreeDirsByWorktree(null)).toEqual({})
    expect(normalizeSourceControlCollapsedTreeDirsByWorktree([])).toEqual({})
  })
})
