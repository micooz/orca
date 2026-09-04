/** Marks the filename text, which doubles as the double-click-to-rename hotspot. */
export const RENAME_HOTSPOT_ATTR = 'data-file-explorer-row-name'

export type DirToggleTiming = 'immediate' | 'skip'

export function isRenameHotspotTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[${RENAME_HOTSPOT_ATTR}]`) !== null
}

/**
 * Why: the first click must stay responsive while later clicks in the same
 * rename gesture must not toggle the directory again.
 */
export function resolveDirToggleTiming({
  fromRenameHotspot,
  clickCount
}: {
  fromRenameHotspot: boolean
  clickCount: number
}): DirToggleTiming {
  if (!fromRenameHotspot) {
    return 'immediate'
  }
  return clickCount > 1 ? 'skip' : 'immediate'
}
