import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SectionHeader } from './listing/section-header'

describe('Source Control section header', () => {
  it('reserves a 24px row when filtered bulk actions are absent', () => {
    const markup = renderToStaticMarkup(
      SectionHeader({ label: 'Changes', count: 2, isCollapsed: false, onToggle: vi.fn() })
    )

    expect(markup).toContain('group/section flex min-h-6 items-center')
  })
})
