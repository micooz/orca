export const SOURCE_CONTROL_SECTION_IDS = [
  'history',
  'branch',
  'unstaged',
  'staged',
  'untracked',
  'conflicts'
] as const

export type SourceControlSectionId = (typeof SOURCE_CONTROL_SECTION_IDS)[number]

export const DEFAULT_SOURCE_CONTROL_COLLAPSED_SECTIONS: readonly SourceControlSectionId[] = [
  'history'
]

const SOURCE_CONTROL_SECTION_ID_SET = new Set<string>(SOURCE_CONTROL_SECTION_IDS)

export function normalizeSourceControlCollapsedSections(value: unknown): SourceControlSectionId[] {
  if (!Array.isArray(value)) {
    return []
  }
  return [
    ...new Set(
      value.filter(
        (section): section is SourceControlSectionId =>
          typeof section === 'string' && SOURCE_CONTROL_SECTION_ID_SET.has(section)
      )
    )
  ]
}

export function normalizeSourceControlCollapsedSectionsByWorktree(
  value: unknown
): Record<string, SourceControlSectionId[]> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  const result: Record<string, SourceControlSectionId[]> = {}
  for (const [worktreeId, sections] of Object.entries(value as Record<string, unknown>)) {
    if (
      !worktreeId ||
      worktreeId === '__proto__' ||
      worktreeId === 'constructor' ||
      worktreeId === 'prototype' ||
      !Array.isArray(sections)
    ) {
      continue
    }
    result[worktreeId] = normalizeSourceControlCollapsedSections(sections)
  }
  return result
}
