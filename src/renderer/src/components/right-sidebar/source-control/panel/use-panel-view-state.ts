import { useCallback, useMemo, useRef, useState } from 'react'
import { resolveSourceControlGroupOrder } from '../listing/section-order'
import { getNextSourceControlViewMode } from './header-toolbar'
import { normalizeSourceControlViewMode } from '../commit/commit-drafts'
import type { SourceControlStoreActions } from '../listing/use-store-actions'
import type { SourceControlWorktreeContext } from '../listing/use-worktree-context'
import { useAppStore } from '@/store'
import { DEFAULT_SOURCE_CONTROL_COLLAPSED_SECTIONS } from '../../../../../../shared/source-control-collapsed-sections'
import {
  collapseSourceControlTreeDirectories,
  expandSourceControlTreeDirectories
} from '../source-control-tree-collapse'

/**
 * Local presentation state for the Source Control panel: filter, collapsed sections/directories,
 * list-vs-tree mode and the base-ref dialog, plus the per-worktree reset that keeps a worktree
 * switch from inheriting the previous worktree's view.
 */
export function useSourceControlPanelViewState({
  activeWorktreeId,
  settings,
  updateSettings
}: {
  activeWorktreeId: string | null
  settings: SourceControlWorktreeContext['settings']
  updateSettings: SourceControlStoreActions['updateSettings']
}) {
  const sourceControlRef = useRef<HTMLDivElement | null>(null)
  // Why: virtualize against the panel's shared scroller; use state (not a ref) so lists re-render and start observing once the element attaches.
  const [fileListScrollElement, setFileListScrollElement] = useState<HTMLDivElement | null>(null)
  const isMac = useMemo(() => navigator.userAgent.includes('Mac'), [])
  const [filterExpanded, setFilterExpanded] = useState(false)
  const collapsedSectionsByWorktree = useAppStore(
    (state) => state.sourceControlCollapsedSectionsByWorktree
  )
  const setCollapsedSectionsForWorktree = useAppStore(
    (state) => state.setSourceControlCollapsedSectionsForWorktree
  )
  const collapsedSections = useMemo(
    () =>
      new Set(
        (activeWorktreeId && collapsedSectionsByWorktree[activeWorktreeId]) ??
          DEFAULT_SOURCE_CONTROL_COLLAPSED_SECTIONS
      ),
    [activeWorktreeId, collapsedSectionsByWorktree]
  )
  const persistedSourceControlViewMode = normalizeSourceControlViewMode(
    settings?.sourceControlViewMode
  )
  const sourceControlViewMode = persistedSourceControlViewMode
  const sourceControlGroupOrder = resolveSourceControlGroupOrder(settings?.sourceControlGroupOrder)
  const collapsedTreeDirsByWorktree = useAppStore(
    (state) => state.sourceControlCollapsedTreeDirsByWorktree
  )
  const setCollapsedTreeDirsForWorktree = useAppStore(
    (state) => state.setSourceControlCollapsedTreeDirsForWorktree
  )
  const collapsedTreeDirs = useMemo(
    () => new Set((activeWorktreeId && collapsedTreeDirsByWorktree[activeWorktreeId]) ?? []),
    [activeWorktreeId, collapsedTreeDirsByWorktree]
  )
  const [baseRefDialogOpen, setBaseRefDialogOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const isGitHistoryExpanded = !collapsedSections.has('history')

  const handleToggleSourceControlViewMode = useCallback(() => {
    if (!settings) {
      return
    }
    updateSettings({
      sourceControlViewMode: getNextSourceControlViewMode(sourceControlViewMode)
    })
  }, [settings, sourceControlViewMode, updateSettings])

  // Why: reset during render instead of key-remounting on switch (which caused a Windows IPC storm).
  const [viewStateWorktreeId, setViewStateWorktreeId] = useState(activeWorktreeId)
  if (viewStateWorktreeId !== activeWorktreeId) {
    setViewStateWorktreeId(activeWorktreeId)
    setFilterExpanded(false)
    setBaseRefDialogOpen(false)
    // Why: don't reset defaultBaseRef here — it's repo-scoped (resolved on activeRepo change); resetting would clobber non-main defaults.
    setFilterQuery('')
    // Why: don't reset commit-in-flight state — it's per-worktree; resetting would re-enable Commit for an incoming worktree mid-commit.
  }

  const toggleSection = useCallback(
    (section: string) => {
      if (!activeWorktreeId) {
        return
      }
      const next = new Set(collapsedSections)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      setCollapsedSectionsForWorktree(activeWorktreeId, [...next])
    },
    [activeWorktreeId, collapsedSections, setCollapsedSectionsForWorktree]
  )

  const toggleTreeDir = useCallback(
    (key: string) => {
      if (!activeWorktreeId) {
        return
      }
      const next = new Set(collapsedTreeDirs)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      setCollapsedTreeDirsForWorktree(activeWorktreeId, [...next])
    },
    [activeWorktreeId, collapsedTreeDirs, setCollapsedTreeDirsForWorktree]
  )

  const collapseAllTreeDirs = useCallback(
    (directoryKeys: readonly string[]) => {
      if (activeWorktreeId) {
        setCollapsedTreeDirsForWorktree(activeWorktreeId, [
          ...collapseSourceControlTreeDirectories(collapsedTreeDirs, directoryKeys)
        ])
      }
    },
    [activeWorktreeId, collapsedTreeDirs, setCollapsedTreeDirsForWorktree]
  )

  const expandAllTreeDirs = useCallback(
    (directoryKeys: readonly string[]) => {
      if (activeWorktreeId) {
        setCollapsedTreeDirsForWorktree(activeWorktreeId, [
          ...expandSourceControlTreeDirectories(collapsedTreeDirs, directoryKeys)
        ])
      }
    },
    [activeWorktreeId, collapsedTreeDirs, setCollapsedTreeDirsForWorktree]
  )

  return {
    baseRefDialogOpen,
    collapseAllTreeDirs,
    collapsedSections,
    collapsedTreeDirs,
    expandAllTreeDirs,
    fileListScrollElement,
    filterExpanded,
    filterQuery,
    handleToggleSourceControlViewMode,
    isGitHistoryExpanded,
    isMac,
    setBaseRefDialogOpen,
    setFileListScrollElement,
    setFilterExpanded,
    setFilterQuery,
    sourceControlGroupOrder,
    sourceControlRef,
    sourceControlViewMode,
    toggleSection,
    toggleTreeDir
  }
}

export type SourceControlPanelViewState = ReturnType<typeof useSourceControlPanelViewState>
