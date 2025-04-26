import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Pages/Home';
import Gameover from './Pages/Gameover';
import Duel from './Pages/Duel';
import "./App.css"
import Lobby from './Pages/Lobby';
import Start from './Pages/Start';

function App() {

  const roomLink = "roomOne"
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={`/:roomCode/:userIsHost/lobby`} element={<Lobby />} />
          <Route path={`/:roomCode/:userIsHost/start`} element={<Start />} />
          <Route path={`/:roomCode/:userIsHost/duel`} element={<Duel />} />
          <Route path={`/:roomCode/:userIsHost/gameover`} element={<Gameover />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
