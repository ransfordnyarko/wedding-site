import { useEffect } from 'react'
import './styles/globals.css'
import Nav       from './components/Nav'
import Hero      from './components/Hero'
import About     from './components/About'
import ThreadSection from './components/thread/ThreadSection'
import Portfolio from './components/Portfolio'
import Details   from './components/Details'
import Contact   from './components/Contact'
import Gifts     from './components/Gifts'
import Footer    from './components/Footer'

export default function App() {
  // Custom cursor
  useEffect(() => {
    const cursor = document.getElementById('cursor')
    if (!cursor) return
    const move = e => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
    }
    const expand = () => cursor.classList.add('expanded')
    const shrink = () => cursor.classList.remove('expanded')
    window.addEventListener('mousemove', move)
    document.querySelectorAll('a, button, img').forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', shrink)
    })
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div id="cursor" />
      <Nav />
      <Hero />
      <About />
      <ThreadSection />
      <Portfolio />
      <Details />
      <Contact />
      <Gifts />
      <Footer />
    </>
  )
}
