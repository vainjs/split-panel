import type { MutableRefObject, CSSProperties, ReactNode } from 'react'

export type {
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  CSSProperties,
  ReactNode,
  FC,
} from 'react'

export type Direction = 'horizontal' | 'vertical'

// native event
export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent

export type ResizeHandle = (event: ResizeEvent, handle: HTMLDivElement) => void

export type PanelProps = {
  onResize?: (collapsed: boolean) => void
  collapsedSize?: number
  collapsible?: boolean
  style?: CSSProperties
  children?: ReactNode
  className?: string
  minSize?: number
  maxSize?: number
}

export type PanelRef = {
  resize: (size: number | string) => void
  collapse: () => void
}

export type PanelData = Omit<PanelProps, 'style' | 'children'>

export type PanelDataRef = MutableRefObject<PanelData>

export type Panels = Map<string, PanelDataRef>

export type PanelsRef = MutableRefObject<Panels>

export type CursorState =
  | 'horizontal-collapsibled'
  | 'vertical-collapsibled'
  | 'horizontal'
  | 'vertical'

/**
 * [size, flexSize]
 */
export type PanelSizes = Record<string, [number, number]>

export type InitHandleState = { correctOffset?: number }

export type PanelGroupContextProps = {
  onStartDragging: (
    handleId: string,
    event: ResizeEvent,
    handle: HTMLDivElement
  ) => void
  registerPanel: (panelId: string, panel: PanelDataRef) => void
  registerResizeHandle: (handleId: string) => ResizeHandle
  resize: (panelId: string, size: number | string) => void
  unregisterPanel: (panelId: string) => void
  onStopDragging: (handleId: string) => void
  activeHandleId: string | null
  direction: Direction
  sizes: PanelSizes
}

export type PanelGroupProps = {
  direction?: Direction
  style?: CSSProperties
  children?: ReactNode
  className?: string
}

export type PanelGroupRef = {
  reset(): void
}

export type PanelResizeHandleProps = {
  style?: CSSProperties
  highlightColor?: string
  highlightSize?: number
  triggerSize?: number
  hoverable?: boolean
  className?: string
  disabled?: boolean
}
