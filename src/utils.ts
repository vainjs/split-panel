import type {
  CSSProperties,
  CursorState,
  ResizeEvent,
  PanelSizes,
  Direction,
  PanelsRef,
} from './type'
import { startsWith, get, forEach, isNil, isString } from 'lodash'

export function isMouseEvent(event: ResizeEvent): event is MouseEvent {
  return startsWith(event.type, 'mouse')
}

export function getMovement(
  event: ResizeEvent,
  resizeHandle: HTMLDivElement,
  direction: Direction,
  initialOffset = 0
): number {
  const isHorizontal = direction === 'horizontal'

  let pointerOffset = 0
  if (isMouseEvent(event)) {
    pointerOffset = isHorizontal ? event.clientX : event.clientY
  } else {
    return 0
  }

  const rect = resizeHandle.getBoundingClientRect()
  const handlerOffset = isHorizontal ? rect.left : rect.top
  return pointerOffset - handlerOffset - initialOffset
}

export function getSize(dom: HTMLDivElement, direction: Direction) {
  if (!dom) return 0
  const rect = dom.getBoundingClientRect()
  return direction === 'horizontal' ? rect.width : rect.height
}

function getFlexSize(actualSize: number, baseSize: number) {
  return (actualSize / baseSize) * 100
}

export function calculateSize(
  panelId: string,
  size: number,
  panels: PanelsRef
) {
  const panelData = get(panels.current.get(panelId), 'current') || {}
  const { minSize, maxSize } = panelData
  let actualSize = size
  if (!isNil(minSize)) {
    actualSize = Math.max(actualSize, minSize)
  }
  if (!isNil(maxSize)) {
    actualSize = Math.min(actualSize, maxSize)
  }
  return actualSize
}

export function getActualPanelSize(
  panelId: HTMLDivElement | string,
  size: number,
  baseSize: number,
  panels: PanelsRef
): PanelSizes {
  panelId = isString(panelId)
    ? panelId
    : (panelId.getAttribute('data-panel-id') as string)
  const actualSize = calculateSize(panelId, size, panels)
  const flexSize = getFlexSize(actualSize, baseSize)
  return { [panelId]: [actualSize, flexSize] }
}

export function getPrevAndNextResultByHandle(
  handle: HTMLDivElement,
  group: HTMLDivElement,
  movement: number,
  direction: Direction,
  panels: PanelsRef
): PanelSizes | undefined {
  const prev = handle.previousSibling as HTMLDivElement
  const next = handle.nextSibling as HTMLDivElement
  if (!prev || !next) return
  const baseSize = getSize(group, direction)
  const prevSize = getSize(prev, direction)
  const nextSize = getSize(next, direction)

  let prevNewSize = prevSize + movement
  let nextNewSize = nextSize - movement
  if (prevNewSize <= 0) {
    nextNewSize += prevNewSize
    prevNewSize = 0
  } else if (nextNewSize <= 0) {
    prevNewSize += nextNewSize
    nextNewSize = 0
  }

  return {
    ...getActualPanelSize(prev, prevNewSize, baseSize, panels),
    ...getActualPanelSize(next, nextNewSize, baseSize, panels),
  }
}

export function getCursorStyle(state: CursorState) {
  switch (state) {
    case 'horizontal':
      return 'col-resize'
    case 'vertical':
      return 'row-resize'
    case 'horizontal-collapsibled':
      return 'ew-resize'
    case 'vertical-collapsibled':
      return 'ns-resize'
  }
}

export function setIframeEventStyle(
  pointerEvents: CSSProperties['pointerEvents'] = 'auto'
) {
  forEach(document.querySelectorAll('iframe'), (iframe) => {
    if (iframe.style.pointerEvents !== pointerEvents) {
      iframe.style.setProperty('pointer-events', pointerEvents)
    }
  })
}

export function getResizeHandle(id: string): HTMLDivElement | null {
  return document.querySelector(`[data-panel-handle-id="${id}"]`)
}
