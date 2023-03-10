import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import store from '../store/index.js';
import AllPokemons from './allPokemons/allPokemons.jsx';
import PokedexPagination from './pokedexPagination/pokedexPagination.jsx';
import Pokedex from './pokedex/pokedex.jsx';
import Error from './error/error.jsx';

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokemons" element={<AllPokemons />} />
        <Route path="/pokedex-list" element={<PokedexPagination />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);

export default App;
