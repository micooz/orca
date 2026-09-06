import { describe, expect, it } from 'vitest'
import {
  collapseSourceControlTreeDirectories,
  expandSourceControlTreeDirectories,
  getSourceControlTreeCollapseControl
} from './source-control-tree-collapse'

const DIRECTORY_KEYS = ['dir::unstaged::src', 'dir::branch::docs']

describe('source control tree collapse', () => {
  it('enables collapse only for tree views with directories', () => {
    expect(getSourceControlTreeCollapseControl('list', DIRECTORY_KEYS, new Set())).toEqual({
      action: 'collapse',
      enabled: false
    })
    expect(getSourceControlTreeCollapseControl('tree', [], new Set())).toEqual({
      action: 'collapse',
      enabled: false
    })
    expect(getSourceControlTreeCollapseControl('tree', DIRECTORY_KEYS, new Set())).toEqual({
      action: 'collapse',
      enabled: true
    })
  })

  it('offers expand only when every projected directory is collapsed', () => {
    expect(
      getSourceControlTreeCollapseControl('tree', DIRECTORY_KEYS, new Set(DIRECTORY_KEYS))
    ).toEqual({ action: 'expand', enabled: true })
    expect(
      getSourceControlTreeCollapseControl('tree', DIRECTORY_KEYS, new Set([DIRECTORY_KEYS[0]]))
    ).toEqual({ action: 'collapse', enabled: true })
  })

  it('collapses projected directories without dropping filtered-out state', () => {
    expect(
      collapseSourceControlTreeDirectories(new Set(['dir::staged::hidden']), DIRECTORY_KEYS)
    ).toEqual(new Set(['dir::staged::hidden', ...DIRECTORY_KEYS]))
  })

  it('expands projected directories without changing filtered-out state', () => {
    expect(
      expandSourceControlTreeDirectories(
        new Set(['dir::staged::hidden', ...DIRECTORY_KEYS]),
        DIRECTORY_KEYS
      )
    ).toEqual(new Set(['dir::staged::hidden']))
  })
})
