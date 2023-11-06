import type {
  InitHandleState,
  PanelGroupProps,
  PanelGroupRef,
  PanelDataRef,
  ResizeEvent,
  PanelSizes,
  Panels,
} from './type'
import {
  useImperativeHandle,
  useCallback,
  forwardRef,
  useState,
  useMemo,
  useRef,
  useId,
  memo,
} from 'react'
import {
  getPrevAndNextResultByHandle,
  getActualPanelSize,
  isMouseEvent,
  getMovement,
  getSize,
} from './utils'
import { PanelGroupContext } from './GroupContext'

const PanelGroup = forwardRef<PanelGroupRef, PanelGroupProps>((props, ref) => {
  const { children, style, className, direction = 'horizontal' } = props
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null)
  const initHandleStateRef = useRef<InitHandleState>({})
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [sizes, setSizes] = useState<PanelSizes>({})
  const panels = useRef<Panels>(new Map())
  const groupId = useId()

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        setSizes({})
      },
    }),
    []
  )

  const registerResizeHandle = useCallback(
    (handleId: string) => {
      return (e: ResizeEvent, handle: HTMLDivElement) => {
        e.preventDefault()
        if (!activeHandleId || activeHandleId !== handleId || !groupRef.current)
          return
        const movement = getMovement(
          e,
          handle,
          direction,
          initHandleStateRef.current.correctOffset
        )
        if (movement === 0) return
        const result = getPrevAndNextResultByHandle(
          handle,
          groupRef.current,
          movement,
          direction,
          panels
        )
        if (!result) return
        setSizes((prev) => ({ ...prev, ...result }))
      }
    },
    [direction, activeHandleId]
  )

  const registerPanel = useCallback(
    (panelId: string, panelRef: PanelDataRef) => {
      if (!panels.current.has(panelId)) {
        panels.current.set(panelId, panelRef)
      }
    },
    []
  )

  const unregisterPanel = useCallback((panelId: string) => {
    if (panels.current.has(panelId)) {
      panels.current.delete(panelId)
    }
  }, [])

  const onStartDragging = useCallback(
    (handleId: string, event: ResizeEvent, handle: HTMLDivElement) => {
      setActiveHandleId(handleId)
      if (isMouseEvent(event)) {
        initHandleStateRef.current = {
          correctOffset: event.clientX - handle.getBoundingClientRect().left,
        }
      }
    },
    []
  )

  const onStopDragging = useCallback(() => {
    setActiveHandleId(null)
    setSizes((prev) => {
      const newPanelSizes: PanelSizes = {}
      for (const panelId in prev) {
        if (Object.prototype.hasOwnProperty.call(prev, panelId)) {
          const panelDataRef = panels.current.get(panelId)
          if (!panelDataRef) continue
          const { collapsedSize = 0, collapsible } = panelDataRef.current || {}
          const [actualSize] = prev[panelId]
          if (collapsible && actualSize <= collapsedSize) {
            newPanelSizes[panelId] = [0, 0]
          }
        }
      }
      return { ...prev, ...newPanelSizes }
    })
  }, [])

  const resize = useCallback(
    (panelId: string, size: number | string) => {
      const baseSize = getSize(groupRef.current!, direction)
      if (size === 'auto') {
        size = baseSize
      }
      setSizes((prev) => ({
        ...prev,
        ...getActualPanelSize(panelId, size as number, baseSize, panels),
      }))
    },
    [direction]
  )

  const contextValue = useMemo(
    () => ({
      registerResizeHandle,
      unregisterPanel,
      onStartDragging,
      onStopDragging,
      registerPanel,
      activeHandleId,
      direction,
      resize,
      sizes,
    }),
    [
      registerResizeHandle,
      unregisterPanel,
      onStartDragging,
      onStopDragging,
      registerPanel,
      activeHandleId,
      direction,
      resize,
      sizes,
    ]
  )

  return (
    <PanelGroupContext.Provider value={contextValue}>
      <div
        style={{ ...style, display: 'flex' }}
        data-panel-direction={direction}
        data-panel-group-id={groupId}
        className={className}
        ref={groupRef}>
        {children}
      </div>
    </PanelGroupContext.Provider>
  )
})

export default memo(PanelGroup)
