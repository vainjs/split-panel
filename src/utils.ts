import type {
  Direction,
  ResizeEvent,
  PanelsRef,
  CursorState,
  CSSProperties,
} from './type'
import { startsWith, get, forEach } from 'lodash'

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

function getActualPanelInfo(
  dom: HTMLDivElement,
  size: number,
  panels: PanelsRef
): [string, number] {
  const panelId = dom.getAttribute('data-panel-id') as string
  const panelData = get(panels.current.get(panelId), 'current')
  if (!panelData) return [panelId, size]

  let actualSize = size
  const { minSize, maxSize, collapsible, collapsedSize = 0 } = panelData
  if (minSize) {
    actualSize = Math.max(actualSize, minSize)
  }
  if (maxSize) {
    actualSize = Math.min(actualSize, maxSize)
  }
  if (collapsible && size <= collapsedSize) {
    actualSize = 0
  }
  return [panelId, actualSize]
}

export function getPrevAndNextResultByHandle(
  handle: HTMLDivElement,
  group: HTMLDivElement,
  movement: number,
  direction: Direction,
  panels: PanelsRef
) {
  const prev = handle.previousSibling as HTMLDivElement
  const next = handle.nextSibling as HTMLDivElement
  if (!prev || !next) return
  const baseSize = getSize(group, direction)
  const prevSize = getSize(prev, direction)
  const nextSize = getSize(next, direction)
  const [prevId, prevActualSize] = getActualPanelInfo(
    prev,
    prevSize + movement,
    panels
  )
  const [nextId, nextActualSize] = getActualPanelInfo(
    next,
    nextSize - movement,
    panels
  )

  return {
    [prevId]: (prevActualSize / baseSize) * 100,
    [nextId]: (nextActualSize / baseSize) * 100,
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
