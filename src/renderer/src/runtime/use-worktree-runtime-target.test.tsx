// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/store', async () => {
  const { useStore } = await import('zustand')
  const { createStore } = await import('zustand/vanilla')
  const store = createStore(() => ({ executionHostId: 'runtime:env-1' }))
  return {
    useAppStore: (selector: (state: { executionHostId: string }) => unknown) =>
      useStore(store, selector)
  }
})

vi.mock('@/lib/worktree-runtime-owner', () => ({
  getExecutionHostIdForWorktree: (state: { executionHostId: string }) => state.executionHostId
}))

import { useWorktreeRuntimeTarget } from './use-worktree-runtime-target'

describe('useWorktreeRuntimeTarget', () => {
  let container: HTMLDivElement | null = null

  afterEach(() => {
    container?.remove()
    container = null
  })

  it('keeps the Zustand snapshot stable while resolving the runtime target', () => {
    const targets: unknown[] = []
    function Probe(): null {
      targets.push(useWorktreeRuntimeTarget('worktree-1'))
      return null
    }

    container = document.createElement('div')
    const root = createRoot(container)
    act(() => root.render(<Probe />))

    expect(targets).toEqual([{ kind: 'environment', environmentId: 'env-1' }])

    act(() => root.unmount())
  })
})
