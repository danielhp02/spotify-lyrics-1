const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');
const axios = require('axios');
const Genius = require("genius-lyrics");
const fs = require('fs');
var geniusKey;
fs.readFile('./tokens.json', 'utf8', (error, data) => {
    if(error) {
        console.log('error');
    } else {
        const json_data = JSON.parse(data);
        geniusKey = data.genius_api_token;
    }
});
const Client = new Genius.Client(geniusKey);


router.use(cookieParser());

// GET home page
router.get('/', async (req, res, next) => {
    if(req.cookies.spotifyAccessToken) {
        if(req.cookies.geniusAccessToken) {
            // we have both tokens !
            const track = await spotifyFetch(req);
            var trackName;
            if (track.name.includes(' - ') && track.name.toUpperCase().includes('REMASTER')) {
                trackName = track.name.split(' - ')[0];
            } else {
                trackName = track.name;
            }
            var lyrics = await geniusFetch(track, trackName);
            if(lyrics == 0) {
                lyrics = ['No lyrics found. Check Genius?'];
            } else {
                lyrics = lyrics.split('\n');
            }
            res.render('playing', { 
                title: `now playing: ${track.name}`, 
                trackName: track.name,
                artistName: track.artists[0].name, 
                albumArt: track.album.images[1].url,
                artistLink: track.artists[0].external_urls.spotify,
                trackLink: track.external_urls.spotify,
                lastfmTrackName: encodeURI(trackName),
                lastfmArtistName: encodeURIComponent(track.artists[0].name),
                lyrics: lyrics
            });
        } else {
            res.redirect('/login/genius');
        }
    } else {
        res.redirect('/login/spotify');
    }
});

async function spotifyFetch(req) {
    return new Promise((resolve, reject) => {
        superagent
        .get('https://api.spotify.com/v1/me/player')
        .set('Authorization', `Bearer ${req.cookies.spotifyAccessToken}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then(spotifyRes => {
            resolve(JSON.parse(spotifyRes.text).item);
        })
        .catch(spotifyErr => {
            reject(spotifyErr);
        })
    })
    
}

async function geniusFetch(track, trackName) {
    var returnValue = 1;
    try {
        var searches = await Client.songs.search(`${trackName} ${track.artists[0].name}`).catch(console.log())
    } catch {
        returnValue = 0
    }
    if (returnValue) {
        var returnValue = await searches[0].lyrics().catch(console.log());
    }
    return returnValue;
}

module.exports = router;