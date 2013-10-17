// oauth provider api keys
module.exports = {
    facebook: {
        clientID: process.env.facebook_clientID || "APP_ID",
        clientSecret: process.env.facebook_clientSecret || "APP_SECRET",
        callbackPath: "/auth/facebook/callback"
    },
    twitter: {
        clientID: process.env.twitter_clientID || "APP_ID",
        clientSecret: process.env.twitter_clientSecret || "APP_SECRET",
        callbackPath: "/auth/twitter/callback"
    },
    google: {
        clientID: process.env.google_clientID || "853318429261.apps.googleusercontent.com",
        clientSecret: process.env.google_clientSecret || "hhGXKCbbmLx9xALyMl_lfU1h",
        callbackPath: "/auth/google/callback"
    }
};