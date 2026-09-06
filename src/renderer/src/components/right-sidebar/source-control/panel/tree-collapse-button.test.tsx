import { describe, expect, it, vi } from 'vitest'
import { ListCollapse, ListRestart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { visit, type ReactElementLike } from '../../file-explorer-element-tree-test-harness'
import { SourceControlTreeCollapseButton } from './tree-collapse-button'

function hasIcon(node: unknown, icon: unknown): boolean {
  let found = false
  visit(node, (entry) => {
    if (entry.type === icon) {
      found = true
    }
  })
  return found
}

function findButton(node: unknown, label: string): ReactElementLike {
  let found: ReactElementLike | null = null
  visit(node, (entry) => {
    if (entry.type === Button && entry.props['aria-label'] === label) {
      found = entry
    }
  })
  if (!found) {
    throw new Error(`${label} button not found`)
  }
  return found
}

describe('SourceControlTreeCollapseButton', () => {
  it('runs collapse with the matching icon and accessible label', () => {
    const onToggle = vi.fn()
    const button = findButton(
      SourceControlTreeCollapseButton({ action: 'collapse', disabled: false, onToggle }),
      'Collapse All'
    )

    ;(button.props.onClick as () => void)()

    expect(onToggle).toHaveBeenCalledOnce()
    expect(button.props['aria-disabled']).toBe(false)
    expect(hasIcon(button, ListCollapse)).toBe(true)
  })

  it('shows expand after all directories are collapsed', () => {
    const button = findButton(
      SourceControlTreeCollapseButton({ action: 'expand', disabled: false, onToggle: vi.fn() }),
      'Expand All'
    )

    expect(hasIcon(button, ListRestart)).toBe(true)
  })

  it('keeps its tooltip trigger active while blocking disabled clicks', () => {
    const onToggle = vi.fn()
    const preventDefault = vi.fn()
    const button = findButton(
      SourceControlTreeCollapseButton({ action: 'collapse', disabled: true, onToggle }),
      'Collapse All'
    )

    ;(button.props.onClick as (event: { preventDefault: () => void }) => void)({ preventDefault })

    expect(button.props.disabled).toBeUndefined()
    expect(button.props['aria-disabled']).toBe(true)
    expect(button.props.className).toContain('cursor-not-allowed')
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(onToggle).not.toHaveBeenCalled()
  })
})
