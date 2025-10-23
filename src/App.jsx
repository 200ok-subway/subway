import { Outlet, ScrollRestoration } from 'react-router-dom'
import './App.css'
import Header from './components/common/Header.jsx'
import Footer from './components/common/Footer.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';

function App() {

  return (
    <>
      <InstallPrompt />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}

export default App;