import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type {
  SearchFileResult,
  SearchMatch,
  SearchResult
} from '../../../../shared/code-search-types'
import type { SearchRow } from './search-rows'
import { FileResultRow, MatchResultRow } from './SearchResultItems'
import { SearchDirectoryResultRow } from './SearchDirectoryResultRow'
import { translate } from '@/i18n/i18n'

const SEARCH_VIRTUAL_OVERSCAN = 12

type SearchResultsPaneProps = {
  results: SearchResult | null
  hasCommittedResults: boolean
  query: string
  loading: boolean
  rows: SearchRow[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  onToggleCollapsedFile: (filePath: string) => void
  onToggleCollapsedDirectory: (directoryKey: string) => void
  onMatchClick: (fileResult: SearchFileResult, match: SearchMatch) => void
}

export function SearchResultsPane({
  results,
  hasCommittedResults,
  query,
  loading,
  rows,
  scrollRef,
  onToggleCollapsedFile,
  onToggleCollapsedDirectory,
  onMatchClick
}: SearchResultsPaneProps): React.JSX.Element {
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const row = rows[index]
      if (!row) {
        return 20
      }
      if (row.type === 'file') {
        return 24
      }
      if (row.type === 'directory') {
        return 24
      }
      return 20
    },
    // Why: match the vertical breathing room around the name-search tree.
    paddingStart: 8,
    paddingEnd: 8,
    overscan: SEARCH_VIRTUAL_OVERSCAN,
    getItemKey: (index) => {
      const row = rows[index]
      if (!row) {
        return `missing:${index}`
      }
      if (row.type === 'file') {
        return `file:${row.fileResult.filePath}`
      }
      if (row.type === 'directory') {
        return row.key
      }
      return `match:${row.fileResult.filePath}:${row.match.line}:${row.match.column}:${row.matchIndex}`
    }
  })

  return (
    <>
      {/* Why: the summary is rendered outside the virtualizer so it stays
         pinned at the top while the user scrolls through results. */}
      {results && rows.length > 0 && (
        <div className="px-2 py-1 text-[10px] text-muted-foreground border-b border-border">
          {results.totalMatches}{' '}
          {translate('auto.components.right.sidebar.Search.6aeda362ed', 'result')}
          {results.totalMatches !== 1 ? 's' : ''}{' '}
          {translate('auto.components.right.sidebar.Search.4107975b3a', 'in')}{' '}
          {results.files.length}{' '}
          {translate('auto.components.right.sidebar.Search.0b8104eaf2', 'file')}
          {results.files.length !== 1 ? 's' : ''}
          {results.truncated &&
            translate('auto.components.right.sidebar.Search.dcc294f28d', '(results truncated)')}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-sleek">
        {rows.length > 0 && (
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) {
                return null
              }

              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {row.type === 'file' && (
                    <FileResultRow
                      fileResult={row.fileResult}
                      collapsed={row.collapsed}
                      depth={row.depth}
                      showParentPath={row.showParentPath}
                      onToggleCollapse={() => onToggleCollapsedFile(row.fileResult.filePath)}
                    />
                  )}
                  {row.type === 'directory' && (
                    <SearchDirectoryResultRow
                      name={row.name}
                      path={row.path}
                      depth={row.depth}
                      matchCount={row.matchCount}
                      collapsed={row.collapsed}
                      onToggleCollapse={() => onToggleCollapsedDirectory(row.key)}
                    />
                  )}
                  {row.type === 'match' && (
                    <MatchResultRow
                      match={row.match}
                      relativePath={row.fileResult.relativePath}
                      depth={row.depth}
                      onClick={() => onMatchClick(row.fileResult, row.match)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!hasCommittedResults && query && !loading && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            {translate('auto.components.right.sidebar.Search.d56d140747', 'Press Enter to search')}
          </div>
        )}

        {!query && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            {translate(
              'auto.components.right.sidebar.Search.1abfb25a66',
              'Type to search in files'
            )}
          </div>
        )}
      </div>
    </>
  )
}
