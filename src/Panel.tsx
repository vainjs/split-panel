import type { PanelData, PanelProps, PanelRef } from './type'
import {
  useImperativeHandle,
  useContext,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useId,
  memo,
} from 'react'
import { PanelGroupContext } from './GroupContext'

const Panel = forwardRef<PanelRef, PanelProps>((props, ref) => {
  const {
    collapsedSize = 10,
    collapsible,
    className,
    onResize,
    children,
    minSize,
    maxSize,
    style,
  } = props
  const { sizes, registerPanel, unregisterPanel, resize } =
    useContext(PanelGroupContext)
  const panelId = useId()
  const [, flexGrow] = sizes[panelId] || []

  const panelDataRef = useRef<PanelData>({
    collapsedSize,
    collapsible,
    onResize,
    minSize,
    maxSize,
  })

  useImperativeHandle(
    ref,
    () => ({
      collapse() {
        if (collapsible) {
          resize(panelId, 0)
        }
      },
      resize(size: number | string) {
        resize(panelId, size)
      },
    }),
    [collapsible, panelId, resize]
  )

  useEffect(() => {
    registerPanel(panelId, panelDataRef)
    return () => {
      unregisterPanel(panelId)
    }
  }, [panelId, registerPanel, unregisterPanel])

  useEffect(() => {
    if (onResize) {
      onResize(flexGrow === 0)
    }
  }, [flexGrow, onResize])

  const actualStyle = useMemo(() => {
    if (flexGrow === undefined) {
      return {
        ...style,
        flexBasis: 'auto',
        flexShrink: 1,
        overflow: 'hidden',
      }
    } else {
      return {
        ...style,
        flexGrow,
        flexBasis: 0,
        flexShrink: 1,
        overflow: 'hidden',
      }
    }
  }, [flexGrow, style])

  return (
    <div style={actualStyle} data-panel-id={panelId} className={className}>
      {children}
    </div>
  )
})

export default memo(Panel)
