const express = require('express');
const router = express.Router();

// GET login page
router.get('/', (req, res, next) => {
    // create url to request to spotify api code to then get access token
    const scopes = encodeURIComponent('user-read-playback-state');
    const redirectURI = encodeURIComponent('http://localhost:3000/callback');
    const clientID = 'de790d81bf5a45189f2273ba2a22cf3f';
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.cookie('state', state, { maxAge: 900000, httpOnly: true });
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${scopes}&redirect_uri=${redirectURI}&state=${state}`);
});

module.exports = router;