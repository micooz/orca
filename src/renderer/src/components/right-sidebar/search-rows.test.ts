import { describe, expect, it } from 'vitest'
import { buildSearchRowProjection, buildSearchRows } from './search-rows'

describe('buildSearchRows', () => {
  it('includes file headers and expanded matches in row order (summary is rendered separately)', () => {
    const rows = buildSearchRows(
      {
        totalMatches: 3,
        truncated: false,
        files: [
          {
            filePath: '/repo/a.ts',
            relativePath: 'a.ts',
            matches: [
              { line: 1, column: 1, matchLength: 3, lineContent: 'foo' },
              { line: 2, column: 5, matchLength: 3, lineContent: 'bar foo' }
            ]
          },
          {
            filePath: '/repo/b.ts',
            relativePath: 'nested/b.ts',
            matches: [{ line: 8, column: 2, matchLength: 3, lineContent: ' foo' }]
          }
        ]
      },
      new Set<string>()
    )

    expect(rows.map((row) => row.type)).toEqual(['file', 'match', 'match', 'file', 'match'])
  })

  it('omits match rows for collapsed files', () => {
    const rows = buildSearchRows(
      {
        totalMatches: 2,
        truncated: true,
        files: [
          {
            filePath: '/repo/a.ts',
            relativePath: 'a.ts',
            matches: [{ line: 1, column: 1, matchLength: 3, lineContent: 'foo' }]
          },
          {
            filePath: '/repo/b.ts',
            relativePath: 'b.ts',
            matches: [{ line: 2, column: 1, matchLength: 3, lineContent: 'foo' }]
          }
        ]
      },
      new Set<string>(['/repo/a.ts'])
    )

    expect(rows.map((row) => row.type)).toEqual(['file', 'file', 'match'])
  })

  it('preserves the file result object for renderer-side count normalization', () => {
    const fileResult = {
      filePath: '/repo/a.ts',
      relativePath: 'a.ts',
      matchCount: 5,
      matches: [{ line: 1, column: 1, matchLength: 3, lineContent: 'foo' }]
    }

    const rows = buildSearchRows(
      {
        totalMatches: 5,
        truncated: false,
        files: [fileResult]
      },
      new Set<string>()
    )

    expect(rows[0]).toMatchObject({ type: 'file', fileResult })
    expect(rows[1]).toMatchObject({ type: 'match', fileResult })
  })
})

describe('buildSearchRowProjection tree mode', () => {
  const match = { line: 1, column: 1, matchLength: 3, lineContent: 'foo' }
  const results = {
    totalMatches: 10,
    truncated: false,
    files: [
      {
        filePath: '/repo/src/renderer/a.ts',
        relativePath: 'src/renderer/a.ts',
        matchCount: 7,
        matches: [match]
      },
      {
        filePath: '/repo/src/main/b.ts',
        relativePath: 'src/main/b.ts',
        matches: [match, match]
      },
      {
        filePath: '/repo/readme.md',
        relativePath: 'readme.md',
        matches: [match]
      }
    ]
  }

  it('groups files into naturally sorted compact directory rows with aggregate match counts', () => {
    const projection = buildSearchRowProjection(results, 'tree', new Set(), new Set())

    expect(
      projection.rows.map((row) =>
        row.type === 'directory'
          ? `${row.type}:${row.path}:${row.matchCount}`
          : row.type === 'file'
            ? `${row.type}:${row.fileResult.relativePath}`
            : row.type
      )
    ).toEqual([
      'directory:src:9',
      'directory:src/main:2',
      'file:src/main/b.ts',
      'match',
      'match',
      'directory:src/renderer:7',
      'file:src/renderer/a.ts',
      'match',
      'file:readme.md',
      'match'
    ])
  })

  it('hides directory descendants and file matches independently', () => {
    const initial = buildSearchRowProjection(results, 'tree', new Set(), new Set())
    const srcKey = initial.directoryKeys.find((key) => key.endsWith('::src'))!
    const projection = buildSearchRowProjection(
      results,
      'tree',
      new Set(['/repo/readme.md']),
      new Set([srcKey])
    )

    expect(projection.rows.map((row) => row.type)).toEqual(['directory', 'file'])
  })
})
