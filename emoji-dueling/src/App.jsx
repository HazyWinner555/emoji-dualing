import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Pages/Home';
import Gameover from './Pages/Gameover';
import Play from './Pages/Play';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Play />} />
          <Route path="/" element={<Gameover />} />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
