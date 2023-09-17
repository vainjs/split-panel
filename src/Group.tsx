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
  isMouseEvent,
  getMovement,
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
    (handId: string) => {
      return (e: ResizeEvent, handle: HTMLDivElement) => {
        e.preventDefault()
        if (!activeHandleId || activeHandleId !== handId || !groupRef.current)
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

  const onStartDragging = useCallback((handId: string, event: ResizeEvent) => {
    setActiveHandleId(handId)
    if (isMouseEvent(event)) {
      const resizeHandle = event.target as HTMLDivElement
      initHandleStateRef.current = {
        correctOffset:
          event.clientX - resizeHandle.getBoundingClientRect().left,
      }
    }
  }, [])

  const onStopDragging = useCallback(() => {
    setActiveHandleId(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      registerResizeHandle,
      unregisterPanel,
      onStartDragging,
      onStopDragging,
      registerPanel,
      activeHandleId,
      direction,
      setSizes,
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
      setSizes,
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
