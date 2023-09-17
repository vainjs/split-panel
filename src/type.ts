import type {
  MutableRefObject,
  SetStateAction,
  CSSProperties,
  ReactNode,
  Dispatch,
  Key,
} from 'react'

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
  onResize?: (collapsed: boolean, key?: Key) => void
  collapsedSize?: number
  collapsible?: boolean
  style?: CSSProperties
  children?: ReactNode
  minSize?: number
  maxSize?: number
  key?: Key
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

export type PanelSizes = Record<string, number>

export type InitHandleState = { correctOffset?: number }

export type PanelGroupContextProps = {
  onStartDragging: (id: string, event: ResizeEvent) => void
  registerPanel: (id: string, panel: PanelDataRef) => void
  registerResizeHandle: (id: string) => ResizeHandle
  setSizes: Dispatch<SetStateAction<PanelSizes>>
  unregisterPanel: (id: string) => void
  onStopDragging: () => void
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
