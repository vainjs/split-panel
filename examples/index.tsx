import React from 'react'
import ReactDOM from 'react-dom/client'
// import {} from '../src/index'
import './index.css'

function App() {
  return (
    <div
      style={{
        width: '80vw',
        height: '80vh',
        background: '#fff',
      }}></div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
