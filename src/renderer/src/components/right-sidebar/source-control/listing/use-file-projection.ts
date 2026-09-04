import { useMemo } from 'react'
import type { GitBranchChangeEntry } from '../../../../../../shared/git-diff-compare-types'
import type { GitStatusEntry } from '../../../../../../shared/git-status-types'
import type { SourceControlViewMode } from '../../../../../../shared/ui-chrome-types'
import { compareGitStatusEntries } from '../../source-control-status-sort'
import {
  filterAndSortSourceControlPathEntries,
  filterSourceControlGroupedPathEntries,
  getSourceControlFileFilterState,
  type SourceControlFileFilterState
} from './file-filter'
import {
  applyGitStatusEntryAreasToSourceControlTree,
  buildGitStatusSourceControlTree,
  buildSourceControlTree,
  compactSourceControlTree,
  flattenSourceControlTree,
  namespaceSourceControlTreeDirectoryKeys,
  type SourceControlTreeNode
} from '../../source-control-tree'
import {
  buildSourceControlDisplaySections,
  mergeUntrackedIntoSourceControlChanges,
  SOURCE_CONTROL_AREAS,
  type SourceControlDisplaySection,
  type SourceControlDisplaySectionId,
  type SourceControlEntryGroups,
  type SourceControlSectionArea
} from './section-order'
import {
  collectListSelectionEntries,
  injectExpandedSubmoduleEntries,
  injectExpandedSubmoduleRows,
  type RenderableSourceControlNode,
  type RenderableSubmoduleListItem,
  type SubmoduleStatusState
} from './submodule-expansion'
import type { FlatEntry } from './use-selection'
import type { GitStatusSourceControlTreeNode } from './directory-action-paths'
import { SUBMODULE_EMPTY_LABEL, SUBMODULE_LOADING_LABEL } from './row-layout'

export type SourceControlFileProjection = {
  grouped: SourceControlEntryGroups
  fileFilterState: SourceControlFileFilterState
  normalizedFilter: string
  isGitHistoryVisible: boolean
  filteredGrouped: SourceControlEntryGroups
  displaySections: SourceControlDisplaySection[]
  unfilteredDisplaySectionsById: ReadonlyMap<
    SourceControlDisplaySectionId,
    SourceControlDisplaySection
  >
  filteredBranchEntries: GitBranchChangeEntry[]
  showCommittedChanges: boolean
  visibleTreeRowsBySection: Partial<
    Record<SourceControlDisplaySectionId, RenderableSourceControlNode[]>
  >
  visibleListRowsBySection: Partial<
    Record<SourceControlDisplaySectionId, RenderableSubmoduleListItem[]>
  >
  visibleBranchTreeRows: SourceControlTreeNode<GitBranchChangeEntry, 'branch'>[]
  visibleSelectionEntries: FlatEntry[]
}

export function useSourceControlFileProjection({
  entries,
  branchEntries,
  filterQuery,
  sourceControlGroupOrder,
  activeWorktreeId,
  worktreePath,
  isFolder,
  collapsedTreeDirs,
  expandedSubmoduleKeys,
  submoduleStatusByKey,
  sourceControlViewMode,
  collapsedSections,
  mergeUntrackedIntoChanges,
  showCommittedChanges
}: {
  entries: GitStatusEntry[]
  branchEntries: GitBranchChangeEntry[]
  filterQuery: string
  sourceControlGroupOrder: readonly SourceControlSectionArea[]
  activeWorktreeId: string | null
  worktreePath: string | null
  isFolder: boolean
  collapsedTreeDirs: Set<string>
  expandedSubmoduleKeys: Set<string>
  submoduleStatusByKey: Record<string, SubmoduleStatusState>
  sourceControlViewMode: SourceControlViewMode
  collapsedSections: Set<string>
  mergeUntrackedIntoChanges: boolean
  showCommittedChanges: boolean
}): SourceControlFileProjection {
  const grouped = useMemo(() => {
    const groups: SourceControlEntryGroups = {
      staged: [],
      unstaged: [],
      untracked: []
    }
    for (const entry of entries) {
      groups[entry.area].push(entry)
    }
    for (const area of SOURCE_CONTROL_AREAS) {
      groups[area].sort(compareGitStatusEntries)
    }
    return groups
  }, [entries])

  const fileFilterState = useMemo(() => getSourceControlFileFilterState(filterQuery), [filterQuery])
  const normalizedFilter = fileFilterState.normalizedFilter
  const isGitHistoryVisible =
    !normalizedFilter &&
    !fileFilterState.tooLarge &&
    Boolean(activeWorktreeId && worktreePath && !isFolder)

  const filteredGrouped = useMemo(
    () => filterSourceControlGroupedPathEntries(grouped, fileFilterState),
    [fileFilterState, grouped]
  )

  const displayGroups = useMemo(
    () => mergeUntrackedIntoSourceControlChanges(filteredGrouped, mergeUntrackedIntoChanges),
    [filteredGrouped, mergeUntrackedIntoChanges]
  )
  const unfilteredDisplayGroups = useMemo(
    () => mergeUntrackedIntoSourceControlChanges(grouped, mergeUntrackedIntoChanges),
    [grouped, mergeUntrackedIntoChanges]
  )
  const displaySections = useMemo(
    () => buildSourceControlDisplaySections(displayGroups, sourceControlGroupOrder),
    [displayGroups, sourceControlGroupOrder]
  )
  const unfilteredDisplaySections = useMemo(
    () => buildSourceControlDisplaySections(unfilteredDisplayGroups, sourceControlGroupOrder),
    [sourceControlGroupOrder, unfilteredDisplayGroups]
  )
  const unfilteredDisplaySectionsById = useMemo(
    () => new Map(unfilteredDisplaySections.map((section) => [section.id, section])),
    [unfilteredDisplaySections]
  )

  const filteredBranchEntries = useMemo(
    () =>
      showCommittedChanges
        ? filterAndSortSourceControlPathEntries(branchEntries, fileFilterState)
        : [],
    [branchEntries, fileFilterState, showCommittedChanges]
  )

  const treeRootsBySection = useMemo(() => {
    const roots: Partial<Record<SourceControlDisplaySectionId, GitStatusSourceControlTreeNode[]>> =
      {}
    for (const section of displaySections) {
      const sectionRoots = compactSourceControlTree(
        buildGitStatusSourceControlTree(section.area, section.items)
      )
      roots[section.id] = applyGitStatusEntryAreasToSourceControlTree(
        section.id === 'conflicts'
          ? namespaceSourceControlTreeDirectoryKeys(sectionRoots, 'conflicts')
          : sectionRoots
      )
    }
    return roots
  }, [displaySections])

  const visibleTreeRowsBySection = useMemo(() => {
    const rows: Partial<Record<SourceControlDisplaySectionId, RenderableSourceControlNode[]>> = {}
    for (const section of displaySections) {
      rows[section.id] = injectExpandedSubmoduleRows(
        flattenSourceControlTree(treeRootsBySection[section.id] ?? [], collapsedTreeDirs),
        expandedSubmoduleKeys,
        submoduleStatusByKey,
        SUBMODULE_LOADING_LABEL,
        SUBMODULE_EMPTY_LABEL
      )
    }
    return rows
  }, [
    collapsedTreeDirs,
    displaySections,
    treeRootsBySection,
    expandedSubmoduleKeys,
    submoduleStatusByKey
  ])

  // List view needs the same lazy submodule expansion as tree view, spliced into the flat entry list.
  const visibleListRowsBySection = useMemo(() => {
    const rows: Partial<Record<SourceControlDisplaySectionId, RenderableSubmoduleListItem[]>> = {}
    for (const section of displaySections) {
      rows[section.id] = injectExpandedSubmoduleEntries(
        section.items,
        expandedSubmoduleKeys,
        submoduleStatusByKey,
        SUBMODULE_LOADING_LABEL,
        SUBMODULE_EMPTY_LABEL
      )
    }
    return rows
  }, [displaySections, expandedSubmoduleKeys, submoduleStatusByKey])

  const branchTreeRoots = useMemo(
    () => compactSourceControlTree(buildSourceControlTree('branch', filteredBranchEntries)),
    [filteredBranchEntries]
  )
  const visibleBranchTreeRows = useMemo(
    () => flattenSourceControlTree(branchTreeRoots, collapsedTreeDirs),
    [branchTreeRoots, collapsedTreeDirs]
  )

  const visibleSelectionEntries = useMemo(() => {
    const arr: FlatEntry[] = []
    // Why: list view splices in lazy submodule rows, so selection/range bookkeeping must read the injected rows, not the pre-injection entries.
    if (sourceControlViewMode === 'list') {
      for (const section of displaySections) {
        if (collapsedSections.has(section.id)) {
          continue
        }
        arr.push(...collectListSelectionEntries(visibleListRowsBySection[section.id] ?? []))
      }
      return arr
    }

    for (const section of displaySections) {
      if (collapsedSections.has(section.id)) {
        continue
      }
      for (const node of visibleTreeRowsBySection[section.id] ?? []) {
        if (node.type === 'file') {
          arr.push({ key: node.key, entry: node.entry, area: node.area })
        }
      }
    }
    return arr
  }, [
    collapsedSections,
    displaySections,
    sourceControlViewMode,
    visibleListRowsBySection,
    visibleTreeRowsBySection
  ])
  return {
    grouped,
    fileFilterState,
    normalizedFilter,
    isGitHistoryVisible,
    filteredGrouped,
    displaySections,
    unfilteredDisplaySectionsById,
    filteredBranchEntries,
    showCommittedChanges,
    visibleTreeRowsBySection,
    visibleListRowsBySection,
    visibleBranchTreeRows,
    visibleSelectionEntries
  }
}
