// @vitest-environment happy-dom

import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FileExplorerRow } from './FileExplorerRow'
import { directoryNode, fileNode } from './file-explorer-tree-node-test-fixtures'
import type { TreeNode } from './file-explorer-types'

function renderRow(node: TreeNode, onStartRename: (target: TreeNode) => void) {
  return render(
    <FileExplorerRow
      node={node}
      isExpanded={false}
      isLoading={false}
      isSelected={false}
      isFlashing={false}
      selectedPaths={new Set()}
      nodeStatus={null}
      statusColor={null}
      isIgnored={false}
      deleteShortcutLabel="Del"
      canOpenInOrcaBrowser={false}
      canCollapseFolderSubtree={false}
      targetDir="/repo/src"
      targetDepth={1}
      selectionSize={1}
      onClick={vi.fn()}
      onDoubleClick={vi.fn()}
      onViewFile={vi.fn()}
      onContextMenuSelect={vi.fn()}
      onCopyPaths={vi.fn()}
      onStartNew={vi.fn()}
      onStartRename={onStartRename}
      onDuplicate={vi.fn()}
      onAddFolderAsProject={vi.fn()}
      canAddAsProject={false}
      onOpenInTerminal={vi.fn()}
      onRequestDelete={vi.fn()}
      onCollapseFolderSubtree={vi.fn()}
      onFindInFolder={vi.fn()}
      onMoveDrop={vi.fn()}
      onDragTargetChange={vi.fn()}
      onDragSourceChange={vi.fn()}
      onDragExpandDir={vi.fn()}
      onNativeDragTargetChange={vi.fn()}
      onNativeDragExpandDir={vi.fn()}
    />
  )
}

describe('FileExplorerRow rename gesture', () => {
  it('does not rename a directory on filename double click', () => {
    const onStartRename = vi.fn()
    const view = renderRow(directoryNode, onStartRename)

    fireEvent.doubleClick(view.container.querySelector('[data-file-explorer-row-name]')!)

    expect(onStartRename).not.toHaveBeenCalled()
  })

  it('still renames a file on filename double click', () => {
    const onStartRename = vi.fn()
    const view = renderRow(fileNode, onStartRename)

    fireEvent.doubleClick(view.container.querySelector('[data-file-explorer-row-name]')!)

    expect(onStartRename).toHaveBeenCalledWith(fileNode)
  })
})
