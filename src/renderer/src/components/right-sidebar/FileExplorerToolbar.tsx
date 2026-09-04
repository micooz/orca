import React from 'react'
import {
  Ellipsis,
  List,
  ListCollapse,
  ListRestart,
  ListTree,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { WorktreeOpenInMenuItems } from '@/components/sidebar/WorktreeOpenInMenu'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { FileSearchViewMode } from '../../../../shared/ui-chrome-types'

type FileExplorerToolbarProps = {
  repoName: string
  worktreePath: string
  connectionId?: string | null
  refresh: {
    isRefreshing: boolean
    showRefreshSpinner: boolean
    handleRefresh: () => void
  }
  canRefresh: boolean
  canCollapseAll: boolean
  collapseAllAction?: 'collapse' | 'expand'
  onCollapseAll: () => void
  onExpandAll?: () => void
  showFileSearchViewModeToggle?: boolean
  fileSearchViewMode?: FileSearchViewMode
  onToggleFileSearchViewMode?: () => void
  showGitIgnoredFilesToggle: boolean
  showGitIgnoredFiles: boolean
  onToggleGitIgnoredFiles: () => void
  showDotfiles: boolean
  onToggleDotfiles: () => void
}

export function FileExplorerToolbar({
  repoName,
  worktreePath,
  connectionId,
  refresh,
  canRefresh,
  canCollapseAll,
  collapseAllAction = 'collapse',
  onCollapseAll,
  onExpandAll,
  showFileSearchViewModeToggle = false,
  fileSearchViewMode = 'list',
  onToggleFileSearchViewMode,
  showGitIgnoredFilesToggle,
  showGitIgnoredFiles,
  onToggleGitIgnoredFiles,
  showDotfiles,
  onToggleDotfiles
}: FileExplorerToolbarProps): React.JSX.Element {
  const collapseAllLabel =
    collapseAllAction === 'expand'
      ? translate('auto.components.right.sidebar.FileExplorerToolbar.expandAll', 'Expand All')
      : translate('auto.components.right.sidebar.FileExplorerToolbar.6026b16950', 'Collapse All')
  return (
    <div className="flex h-8 min-h-8 items-center gap-2 border-b border-border px-2">
      <span
        className="min-w-0 flex-1 truncate text-xs font-medium text-foreground"
        title={repoName}
      >
        {repoName}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              'text-muted-foreground hover:text-foreground',
              !canCollapseAll && 'cursor-not-allowed opacity-50'
            )}
            aria-label={collapseAllLabel}
            aria-disabled={!canCollapseAll}
            // Why: native disabled buttons suppress Radix tooltip triggers in Chromium.
            onClick={(event) => {
              if (!canCollapseAll) {
                event.preventDefault()
                return
              }
              if (collapseAllAction === 'expand') {
                onExpandAll?.()
              } else {
                onCollapseAll()
              }
            }}
          >
            {collapseAllAction === 'expand' ? (
              <ListRestart className="size-3" />
            ) : (
              <ListCollapse className="size-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {collapseAllLabel}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              'text-muted-foreground hover:text-foreground',
              !canRefresh && 'cursor-not-allowed opacity-50'
            )}
            aria-label={translate(
              'auto.components.right.sidebar.FileExplorerToolbar.d95e30fe28',
              'Refresh Explorer'
            )}
            aria-disabled={!canRefresh || refresh.isRefreshing}
            disabled={refresh.isRefreshing}
            onClick={(event) => {
              if (!canRefresh) {
                event.preventDefault()
                return
              }
              refresh.handleRefresh()
            }}
          >
            {refresh.showRefreshSpinner ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {translate(
            'auto.components.right.sidebar.FileExplorerToolbar.d95e30fe28',
            'Refresh Explorer'
          )}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                aria-label={translate(
                  'auto.components.right.sidebar.FileExplorerToolbar.31b4c3195d',
                  'More Explorer Actions'
                )}
              >
                <Ellipsis className="size-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {translate(
              'auto.components.right.sidebar.FileExplorerToolbar.31b4c3195d',
              'More Explorer Actions'
            )}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          {showFileSearchViewModeToggle ? (
            <>
              <DropdownMenuItem onSelect={onToggleFileSearchViewMode}>
                {fileSearchViewMode === 'tree' ? (
                  <List className="size-3.5" />
                ) : (
                  <ListTree className="size-3.5" />
                )}
                {fileSearchViewMode === 'tree'
                  ? translate(
                      'auto.components.right.sidebar.FileExplorerToolbar.viewAsList',
                      'View as list'
                    )
                  : translate(
                      'auto.components.right.sidebar.FileExplorerToolbar.viewAsTree',
                      'View as tree'
                    )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuCheckboxItem checked={showDotfiles} onCheckedChange={onToggleDotfiles}>
            {translate(
              'auto.components.right.sidebar.FileExplorerToolbar.78f133232c',
              'Show Dotfiles'
            )}
          </DropdownMenuCheckboxItem>
          {showGitIgnoredFilesToggle ? (
            <DropdownMenuCheckboxItem
              checked={showGitIgnoredFiles}
              onCheckedChange={onToggleGitIgnoredFiles}
            >
              {translate(
                'auto.components.right.sidebar.FileExplorerToolbar.d238264654',
                'Show Git Ignored Files'
              )}
            </DropdownMenuCheckboxItem>
          ) : null}
          <DropdownMenuSeparator />
          <WorktreeOpenInMenuItems
            worktreePath={worktreePath}
            connectionId={connectionId}
            labelPrefix="Open in "
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
