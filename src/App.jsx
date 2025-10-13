
import './App.css'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './components/common/Header.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import Footer from './components/common/Footer.jsx'

function App() {

  return (
    <>
      <InstallPrompt />
      <Header/>
      <main>
        <Outlet/>
      </main>
      <Footer/>
      <ScrollRestoration></ScrollRestoration>
    </>
  )
}

export default App;
