/* eslint-disable no-unsafe-optional-chaining */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Grid, TextField, FormControl, MenuItem, Select, InputLabel, Pagination, Typography, useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import Loader from '../loader/loader.jsx';
import PokemonItem from '../pokemon/pokemon.jsx';
import Error from '../error/error.jsx';
import getAllPokemons from '../../store/slices/allPokemons/getAllPokemons.js';
import TypeFilter from '../typeFilter/typeFilter.jsx';
import PokemonsServices from '../../api/pokemons/getPokemons.js';

const Pokedex = () => {
  const [query, setQuery] = useState('');
  const [pokeQuantity, setPokeQuantity] = useState(10);
  const [page, setPage] = useState(1);
  const [pagesQuantity, setPagesQuantity] = useState(0);
  const [typeForFilter, setTypeForFilter] = useState('');
  const [pokemons, setPokemons] = useState('');
  const [pageError, setPageError] = useState(null);

  const point500px = useMediaQuery('(min-width:500px)');
  const dispatch = useDispatch();

  const allPokemonsState = useSelector((state) => state.allPokemons);
  const { isLoading } = allPokemonsState;
  const allPokemons = allPokemonsState.pokemons;

  useEffect(() => {
    dispatch(getAllPokemons());
  }, [dispatch]);

  useEffect(() => {
    PokemonsServices.getSomePokemons({
      offset: (page - 1) * pokeQuantity,
      limit: pokeQuantity,
    })
      .then((response) => {
        setPagesQuantity(Math.ceil(response?.data?.count / pokeQuantity));
        return response.data.results;
      })
      .then((data) => {
        const requests = data.map((pokemon) => axios.get(pokemon.url));
        return Promise.all(requests);
      })
      .then((responses) => {
        const newArray = responses.map((el) => {
          const { name } = el.data;
          const { types } = el.data;
          const { weight } = el.data;
          const { height } = el.data;
          const { stats } = el.data;
          const image = el.data.sprites?.front_default;
          const flatTypes = types.map((type) => type.type.name);
          return {
            name, image, types: flatTypes, weight, height, stats,
          };
        });
        setPokemons(newArray);
      })
      .catch((error) => {
        if (error.response) {
          setPageError(`Something went wrong. Error is ${error.response.data}`);
        } else {
          setPageError('Something went wrong. Check your connection and try again.');
        }
      });
  }, [dispatch, pokeQuantity, page]);

  if (pageError) {
    return <Error error={pageError} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Grid container sx={{ padding: '2% 5%', flexDirection: 'column' }}>
      <Grid item>
        <Link to="/pokemons" style={{ paddingBottom: '15px', display: 'inline-block', paddingRight: '20px' }}>See all pokemons with filter</Link>
        <Link to="/pokedex-list" style={{ paddingBottom: '15px', display: 'inline-block' }}>See pokemons with pagination</Link>
      </Grid>
      <Grid item container>
        <Grid item sx={{ width: '80%' }}>
          <TextField
            id="search"
            label="Search field"
            type="search"
            variant="outlined"
            fullWidth
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid item sx={{ width: '20%' }}>
          <FormControl fullWidth>
            <InputLabel id="select-label">On page</InputLabel>
            <Select
              labelId="select-label"
              id="select"
              value={pokeQuantity}
              label="quantity"
              onChange={(e) => setPokeQuantity(e.target.value)}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Typography variant="h5">
        Press type for sort. Now
        {' '}
        {typeForFilter ? `sorted by ${typeForFilter}` : 'no sorted'}
      </Typography>
      <TypeFilter setTypes={setTypeForFilter} />

      {query !== '' || typeForFilter !== ''
        ? (
          <Grid
            item
            container
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0px',
              minWidth: 165,
              width: '100%',
              columnGap: '2%',
              rowGap: '10px',
            }}
          >
            {allPokemons
              .filter((el) => el.name.includes(query))
              .filter((el) => (typeForFilter ? el.types.includes(typeForFilter) : el))
              .map((pokemonStats) => (
                <PokemonItem
                  key={pokemonStats.name}
                  pokemonStats={pokemonStats}
                  typeForFilter={typeForFilter}
                  setTypeForFilter={setTypeForFilter}
                />
              ))}
          </Grid>
        )
        : (
          <>
            <Grid item>
              <Pagination
                count={pagesQuantity}
                page={page}
                onChange={(_, num) => setPage(num)}
                siblingCount={0}
                showFirstButton={!!point500px}
                showLastButton={!!point500px}
                sx={{ pt: '10px', pb: '10px' }}
              />
            </Grid>
            <Grid
              item
              container
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0px',
                minWidth: 165,
                width: '100%',
                columnGap: '2%',
                rowGap: '10px',
              }}
            >
              {pokemons
                .map((pokemonStats) => (
                  <PokemonItem
                    key={pokemonStats.name}
                    pokemonStats={pokemonStats}
                  />
                ))}
            </Grid>
          </>
        )}
    </Grid>
  );
};

export default Pokedex;
