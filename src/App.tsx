import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Reservations from './pages/Reservations'
import { CalTab, ChartTab, HomeTab } from './components/Icons'
import { firebaseEnabled } from './firebase'

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function Shell() {
  const location = useLocation()
  return (
    <>
      <main>
        {!firebaseEnabled && (
          <p className="notice">Modo de prueba: los datos se guardan sólo en este dispositivo.</p>
        )}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/horarios" element={<Page><Stats /></Page>} />
            <Route path="/reservas" element={<Page><Reservations /></Page>} />
          </Routes>
        </AnimatePresence>
      </main>
      <nav className="tabs">
        <NavLink to="/" end><HomeTab /><span>Inicio</span></NavLink>
        <NavLink to="/horarios"><ChartTab /><span>Horarios</span></NavLink>
        <NavLink to="/reservas"><CalTab /><span>Reservas</span></NavLink>
      </nav>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
