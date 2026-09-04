import React from 'react'
import { ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PATH_TREE_DIRECTORY_PADDING_PX, PATH_TREE_INDENT_PX } from './path-tree-row-layout'
import {
  FILE_EXPLORER_ROW_CLASS_NAME,
  FILE_EXPLORER_ROW_HOVER_CLASS_NAME
} from './file-explorer-row-presentation'

export function SearchDirectoryResultRow({
  name,
  path,
  depth,
  matchCount,
  collapsed,
  onToggleCollapse
}: {
  name: string
  path: string
  depth: number
  matchCount: number
  collapsed: boolean
  onToggleCollapse: () => void
}): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(FILE_EXPLORER_ROW_CLASS_NAME, FILE_EXPLORER_ROW_HOVER_CLASS_NAME, 'pr-2')}
          style={{
            paddingLeft: `${depth * PATH_TREE_INDENT_PX + PATH_TREE_DIRECTORY_PADDING_PX}px`
          }}
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
        >
          <ChevronDown
            className={cn(
              'size-3 shrink-0 text-muted-foreground transition-transform',
              collapsed && '-rotate-90'
            )}
          />
          {collapsed ? (
            <Folder className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs text-foreground">{name}</span>
          <span className="shrink-0 rounded-full bg-muted/80 px-1.5 text-[10px] text-muted-foreground">
            {matchCount}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {path}
      </TooltipContent>
    </Tooltip>
  )
}
