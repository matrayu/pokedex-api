require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV = 'production' ? 'tiny' : 'dev'
app.use(morgan(morganSetting))
app.use(cors());
app.use(helmet());

//middleware prior to the get functions
app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    //move to next middleware
    next()
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychich`, `Rock`, `Steel`, `Water`];

//separate middleware function to handle the request
function handleGetTypes(req, res) {
    res.json(validTypes);
}

function handleGetPokemon(req, res) {
    const { name, type } = req.query;
    let response = POKEDEX.pokemon;

    if(name) {
        response = response.filter(pokemon =>
            //case insensitive search
            pokemon.name.toLowerCase().includes(name.toLowerCase())    
        )
    }

    if(type) {
        response = response.filter(pokemon =>
            pokemon.type.includes(type)    
        )
    }

    res.json(response)
}

//app get method to construct our endpoint
app.get('/types', handleGetTypes)

app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'proudction') {
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    /* console.log(`Server listening at http://localhost:${PORT}`) */
});


