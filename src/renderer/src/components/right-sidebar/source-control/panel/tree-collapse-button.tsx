import React from 'react'
import { ListCollapse, ListRestart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { SourceControlTreeCollapseAction } from '../source-control-tree-collapse'

export function SourceControlTreeCollapseButton({
  action,
  disabled,
  onToggle
}: {
  action: SourceControlTreeCollapseAction
  disabled: boolean
  onToggle: () => void
}): React.JSX.Element {
  const label =
    action === 'expand'
      ? translate('sourceControl.tree.expandAll', 'Expand All')
      : translate('sourceControl.tree.collapseAll', 'Collapse All')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            'size-7 shrink-0 text-muted-foreground hover:text-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label={label}
          aria-disabled={disabled}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault()
              return
            }
            onToggle()
          }}
        >
          {action === 'expand' ? (
            <ListRestart className="size-3.5" />
          ) : (
            <ListCollapse className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
