import type {
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
} from 'react'
import { values, some } from 'lodash'
import classNames from 'classnames'
import { getCursorStyle, setIframeEventStyle } from './utils'
import { PanelGroupContext } from './GroupContext'

export type PanelResizeHandleProps = {
  style?: CSSProperties
  className?: string
  disabled?: boolean
}

const PanelResizeHandle: FC<PanelResizeHandleProps> = (props) => {
  const { style, className, disabled } = props
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
  const handleId = useId()
  const isDragging = activeHandleId === handleId

  const onMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      onStartDragging(handleId, event.nativeEvent)
      setIframeEventStyle('none')
    },
    [onStartDragging, handleId]
  )

  const onMouseUp = useCallback(() => {
    onStopDragging()
    setIframeEventStyle('auto')
  }, [onStopDragging])

  useEffect(() => {
    if (disabled) {
      resizeHandleRef.current = null
    } else {
      resizeHandleRef.current = registerResizeHandle(handleId)
    }
  }, [registerResizeHandle, disabled, handleId])

  useEffect(() => {
    if (
      disabled ||
      !handleDomRef.current ||
      !resizeHandleRef.current ||
      !isDragging
    )
      return
    const targetDocument = handleDomRef.current.ownerDocument

    const onMove = (event: ResizeEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resizeHandleRef.current!(event, handleDomRef.current as HTMLDivElement)
    }

    targetDocument.addEventListener('mousemove', onMove)
    targetDocument.addEventListener('touchmove', onMove)
    targetDocument.addEventListener('mouseup', onMouseUp)

    return () => {
      targetDocument.removeEventListener('mousemove', onMove)
      targetDocument.removeEventListener('touchmove', onMove)
      targetDocument.removeEventListener('mouseup', onMouseUp)
    }
  }, [disabled, isDragging, onMouseUp])

  const actualStyle = useMemo(() => {
    const collapsibled = some(values(sizes), (v) => v === 0)
    const cursorState: CursorState = collapsibled
      ? `${direction}-collapsibled`
      : direction

    return {
      ...{
        width: 11,
        margin: '0 -5px',
        cursor: getCursorStyle(cursorState),
        touchAction: 'none' as const,
        userSelect: 'none' as const,
        zIndex: 1,
      },
      ...style,
    }
  }, [style, sizes, direction])

  return (
    <div
      className={classNames('split-panel-resize-handle', className)}
      data-panel-handle-id={handleId}
      onMouseDown={onMouseDown}
      onTouchCancel={onMouseUp}
      onTouchEnd={onMouseUp}
      onMouseUp={onMouseUp}
      style={actualStyle}
      ref={handleDomRef}
    />
  )
}

export default memo(PanelResizeHandle)
