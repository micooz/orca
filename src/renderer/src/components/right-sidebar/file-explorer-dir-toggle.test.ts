// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useFileExplorerHandlers } from './useFileExplorerHandlers'
import type { TreeNode } from './file-explorer-types'

const directoryNode: TreeNode = {
  name: 'components',
  path: '/repo/src/components',
  relativePath: 'src/components',
  isDirectory: true,
  depth: 1
}

function renderHandlers(toggleDir: (worktreeId: string, dirPath: string) => void) {
  return renderHook(() =>
    useFileExplorerHandlers({
      activeWorktreeId: 'wt-1',
      openFile: vi.fn(),
      makePreviewFilePermanent: vi.fn(),
      toggleDir,
      loadDir: vi.fn().mockResolvedValue(true),
      statPath: vi.fn().mockResolvedValue({ isDirectory: true }),
      authorizeExternalPath: vi.fn(),
      markPathAsDirectory: vi.fn(),
      setSelectedPath: vi.fn(),
      scrollRef: createRef<HTMLDivElement>()
    })
  )
}

describe('directory toggle timing', () => {
  it('toggles a directory immediately', async () => {
    const toggleDir = vi.fn()
    const { result } = renderHandlers(toggleDir)

    await act(async () => {
      result.current.handleClick(directoryNode, 'immediate')
      await Promise.resolve()
    })

    expect(toggleDir).toHaveBeenCalledWith('wt-1', directoryNode.path)
  })

  it('does not toggle again for later clicks in a rename gesture', async () => {
    const toggleDir = vi.fn()
    const { result } = renderHandlers(toggleDir)

    await act(async () => {
      result.current.handleClick(directoryNode, 'immediate')
      result.current.handleClick(directoryNode, 'skip')
      await Promise.resolve()
    })

    expect(toggleDir).toHaveBeenCalledTimes(1)
  })
})
