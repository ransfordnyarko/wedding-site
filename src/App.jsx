import { useEffect } from 'react'
import './styles/globals.css'
import Nav       from './components/Nav'
import Hero      from './components/Hero'
import About     from './components/About'
import Services  from './components/Services'
import Portfolio from './components/Portfolio'
import Contact   from './components/Contact'
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
      <Services />
      <Portfolio />
      <Contact />
      <Footer />
    </>
  )
}
