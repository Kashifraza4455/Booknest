import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 👇 store aur Provider import karna hoga
import { Provider } from 'react-redux'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 👇 App ko Provider ke andar wrap karo */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
