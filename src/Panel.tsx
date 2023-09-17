import type { FC, PanelData, PanelProps } from './type'
import { memo, useEffect, useId, useContext, useRef, useMemo } from 'react'
import { PanelGroupContext } from './GroupContext'

const Panel: FC<PanelProps> = (props) => {
  const {
    collapsedSize = 20,
    collapsible,
    onResize,
    children,
    minSize,
    maxSize,
    style,
    key,
  } = props
  const { sizes, registerPanel, unregisterPanel } =
    useContext(PanelGroupContext)
  const panelId = useId()
  const flexGrow = sizes[panelId]

  const panelDataRef = useRef<PanelData>({
    collapsedSize,
    collapsible,
    onResize,
    minSize,
    maxSize,
  })

  useEffect(() => {
    registerPanel(panelId, panelDataRef)

    return () => {
      unregisterPanel(panelId)
    }
  }, [panelId, registerPanel, unregisterPanel])

  useEffect(() => {
    if (onResize) {
      onResize(flexGrow === 0, key)
    }
  }, [flexGrow, key, onResize])

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

  console.log('===========', actualStyle)

  return (
    <div style={actualStyle} data-panel-id={panelId} key={key}>
      {children}
    </div>
  )
}

export default memo(Panel)
