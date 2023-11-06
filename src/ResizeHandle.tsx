import type {
  PanelResizeHandleProps,
  ReactMouseEvent,
  CSSProperties,
  ResizeHandle,
  ResizeEvent,
  CursorState,
  FC,
} from './type'
import {
  memo,
  useMemo,
  useContext,
  useId,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react'
import { values, some } from 'lodash'
import { getCursorStyle, setIframeEventStyle } from './utils'
import { PanelGroupContext } from './GroupContext'

const PanelResizeHandle: FC<PanelResizeHandleProps> = (props) => {
  const {
    highlightSize = 1,
    triggerSize = 6,
    highlightColor,
    hoverable,
    className,
    disabled,
    style,
  } = props
  const {
    registerResizeHandle,
    onStartDragging,
    onStopDragging,
    activeHandleId,
    direction,
    sizes,
  } = useContext(PanelGroupContext)
  const resizeHandleRef = useRef<ResizeHandle | null>(null)
  const handleDomRef = useRef<HTMLDivElement>(null)
  const [isHover, setHover] = useState(false)
  const handleId = useId()
  const isDragging = activeHandleId === handleId

  const onMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (!handleDomRef.current) return
      onStartDragging(handleId, event.nativeEvent, handleDomRef.current)
      setIframeEventStyle('none')
    },
    [onStartDragging, handleId]
  )

  const onMouseUp = useCallback(() => {
    onStopDragging(handleId)
    setIframeEventStyle('auto')
  }, [onStopDragging, handleId])

  useEffect(() => {
    if (disabled) {
      resizeHandleRef.current = null
    } else {
      resizeHandleRef.current = registerResizeHandle(handleId)
    }
  }, [registerResizeHandle, disabled, handleId])

  useEffect(() => {
    if (disabled || !handleDomRef.current || !resizeHandleRef.current) return
    const targetDocument = handleDomRef.current.ownerDocument
    const controller = new AbortController()
    const onMove = (event: ResizeEvent) => {
      resizeHandleRef.current!(event, handleDomRef.current as HTMLDivElement)
    }

    targetDocument.addEventListener('mousemove', onMove, {
      signal: controller.signal,
    })
    targetDocument.addEventListener('touchmove', onMove, {
      signal: controller.signal,
    })
    targetDocument.addEventListener('mouseup', onMouseUp, {
      signal: controller.signal,
    })

    return () => {
      controller.abort()
    }
  }, [disabled, onMouseUp])

  useEffect(() => {
    if (disabled || !handleDomRef.current || !hoverable) return
    const controller = new AbortController()
    handleDomRef.current.addEventListener(
      'mouseenter',
      () => {
        setHover(true)
      },
      { signal: controller.signal }
    )
    handleDomRef.current.addEventListener(
      'mouseleave',
      () => {
        setHover(false)
      },
      { signal: controller.signal }
    )

    return () => {
      controller.abort()
    }
  }, [disabled, hoverable])

  const actualSize = useMemo(() => {
    if (direction === 'horizontal') {
      return {
        width: highlightSize + triggerSize * 2,
        margin: `0 -${triggerSize}px`,
        padding: `0 ${triggerSize}px`,
      }
    }
    if (direction === 'vertical') {
      return {
        height: highlightSize + triggerSize * 2,
        margin: `-${triggerSize}px 0`,
        padding: `${triggerSize}px 0`,
      }
    }
  }, [highlightSize, triggerSize, direction])

  const actualStyle: CSSProperties = useMemo(() => {
    const collapsibled = some(values(sizes), ([v]) => v === 0)
    const cursorState: CursorState = collapsibled
      ? `${direction}-collapsibled`
      : direction

    return {
      ...actualSize,
      ...{
        backgroundColor:
          (isDragging || isHover) && highlightColor
            ? highlightColor
            : undefined,
        cursor: getCursorStyle(cursorState),
        backgroundClip: 'content-box',
        boxSizing: 'border-box',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 9,
      },
      ...style,
    }
  }, [style, sizes, direction, actualSize, highlightColor, isDragging, isHover])

  return (
    <div
      data-panel-handle-active={isDragging ? true : undefined}
      data-panel-handle-id={handleId}
      onMouseDown={onMouseDown}
      onTouchCancel={onMouseUp}
      onTouchEnd={onMouseUp}
      onMouseUp={onMouseUp}
      className={className}
      style={actualStyle}
      ref={handleDomRef}
    />
  )
}

export default memo(PanelResizeHandle)
