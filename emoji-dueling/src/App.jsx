import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Pages/Home';
import Gameover from './Pages/Gameover';
import Duel from './Pages/Duel';
import Setup from './Pages/Setup';
import Host from './Pages/Host';
import "./App.css"

function App() {

  const roomLink = "roomOne"
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={`/${roomLink}`} element={<Host />} />
          <Route path={`/${roomLink}/setup`} element={<Setup />} />
          <Route path={`/${roomLink}/duel`} element={<Duel />} />
          <Route path={`/${roomLink}/gameover`} element={<Gameover />} />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
