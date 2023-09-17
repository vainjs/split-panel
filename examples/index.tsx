import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import {
  PanelResizeHandle,
  PanelGroupRef,
  PanelGroup,
  Panel,
} from '../src/index'
import './index.css'

function App() {
  const ref = useRef<PanelGroupRef>(null)

  return (
    <div
      style={{
        width: '80vw',
        height: '80vh',
        background: '#fff',
      }}>
      <PanelGroup style={{ height: '100%' }} ref={ref}>
        <Panel style={{ flexGrow: 1 }} collapsible>
          left
        </Panel>
        <PanelResizeHandle />
        <Panel style={{ width: 300, border: 'solid 1px #ccc' }} collapsible>
          right
          <button
            onClick={() => {
              if (ref.current) {
                ref.current.reset()
              }
            }}>
            reset
          </button>
        </Panel>
      </PanelGroup>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
