import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MainScenePrototype from './MainScenePrototype'
import './MainScenePrototype.css'

createRoot(document.getElementById('root')!).render(<StrictMode><MainScenePrototype /></StrictMode>)
