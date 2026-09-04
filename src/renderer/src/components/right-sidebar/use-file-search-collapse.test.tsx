// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFileSearchCollapse } from './use-file-search-collapse'

const projection = {
  rows: [],
  directoryKeys: ['dir::search::src', 'dir::search::src/components'],
  filePaths: ['/repo/src/a.ts', '/repo/src/components/b.ts']
}

describe('useFileSearchCollapse', () => {
  it('collapses and expands every current directory and file result', () => {
    const updateSearchState = vi.fn()
    const { result, rerender } = renderHook(
      ({ collapsedFiles, collapsedDirectories }) =>
        useFileSearchCollapse({
          projection,
          collapsedFiles,
          collapsedDirectories,
          updateSearchState
        }),
      {
        initialProps: { collapsedFiles: new Set<string>(), collapsedDirectories: new Set<string>() }
      }
    )

    expect(result.current.canToggleAll).toBe(true)
    expect(result.current.allCollapsed).toBe(false)
    act(() => result.current.collapseAll())
    expect(updateSearchState).toHaveBeenLastCalledWith({
      collapsedDirectories: new Set(projection.directoryKeys),
      collapsedFiles: new Set(projection.filePaths)
    })

    rerender({
      collapsedFiles: new Set(projection.filePaths),
      collapsedDirectories: new Set(projection.directoryKeys)
    })
    expect(result.current.allCollapsed).toBe(true)
    act(() => result.current.expandAll())
    expect(updateSearchState).toHaveBeenLastCalledWith({
      collapsedDirectories: new Set(),
      collapsedFiles: new Set()
    })
  })

  it('toggles one directory without changing file state', () => {
    const updateSearchState = vi.fn()
    const { result } = renderHook(() =>
      useFileSearchCollapse({
        projection,
        collapsedFiles: new Set(),
        collapsedDirectories: new Set(['dir::search::src']),
        updateSearchState
      })
    )

    act(() => result.current.toggleDirectory('dir::search::src/components'))
    expect(updateSearchState).toHaveBeenCalledWith({
      collapsedDirectories: new Set(projection.directoryKeys)
    })
  })

  it('collapses and expands file groups in list mode', () => {
    const updateSearchState = vi.fn()
    const { result, rerender } = renderHook(
      ({ collapsedFiles }) =>
        useFileSearchCollapse({
          projection: { ...projection, directoryKeys: [] },
          collapsedFiles,
          collapsedDirectories: new Set(),
          updateSearchState
        }),
      { initialProps: { collapsedFiles: new Set<string>() } }
    )

    expect(result.current.canToggleAll).toBe(true)
    act(() => result.current.collapseAll())
    expect(updateSearchState).toHaveBeenLastCalledWith({
      collapsedDirectories: new Set(),
      collapsedFiles: new Set(projection.filePaths)
    })

    rerender({ collapsedFiles: new Set(projection.filePaths) })
    expect(result.current.allCollapsed).toBe(true)
    act(() => result.current.expandAll())
    expect(updateSearchState).toHaveBeenLastCalledWith({
      collapsedDirectories: new Set(),
      collapsedFiles: new Set()
    })
  })
})
