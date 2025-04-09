// Forked from spotify-auth-cli, updated for 2025 and access-token oauth flow

const open = require('open')
const express = require('express')
const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const clipboardy = require('clipboardy')
const request = require('request')

const PORT = argv.port || 4815
const HOST = argv.host || '127.0.0.1'
const PROTOCOL = argv.protocol || 'http'

const CLIENT_ID = argv.clientId;
const CLIENT_SECRET = argv.clientSecret;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('No Client ID or Secret provided, please provide a clientId using --clientId and --clientSecret options')
}

const SHOW_DIALOG = argv.showDialog || false
const SCOPE = argv.scope ? argv.scope.split(',').join('%20') : [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-follow-modify",
  "user-follow-read",
  "user-read-playback-position",
  "user-top-read",
  "user-read-recently-played",
  "user-library-modify",
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "user-soa-link",
  "user-soa-unlink",
  "soa-manage-entitlements",
  "soa-manage-partner",
  "soa-create-partner",
].join('%20')

const REDIRECT_URI = argv.redirect_uri || `${PROTOCOL}://${HOST}:${PORT}/callback`

const requestState = Math.random().toString(36).substring(2, 15);

const URL =
  'https://accounts.spotify.com/authorize'
  + '?client_id=' + CLIENT_ID
  + '&response_type=code'
  + '&scope=' + SCOPE
  + '&state=' + encodeURIComponent(requestState)
  + '&show_dialog=' + SHOW_DIALOG
  + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI)

const app = express()

app.get('/callback', (req, res) => {
  console.log(chalk.blue('Received callback...'), req)

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null || state !== requestState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        state: state,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
    console.log(chalk.blue('Requesting token...'))
    request.post(authOptions, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        console.log(chalk.red('Error getting tokens: '), error);
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      } else {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;
        
        clipboardy.writeSync(access_token)
        console.log(chalk.green('Your access token is: '), chalk.bold(access_token))
        console.log('(It has been copied to your clipboard)')
        console.log(chalk.green('Your refresh token is: '), chalk.bold(refresh_token))

        res.send(`
          <html>
            <body>
              <h1>Authorization Successful</h1>
              <p>Your access token has been copied to your clipboard.</p>
              <script>
                setTimeout(() => {
                  window.close();
                }, 2000);
              </script>
            </body>
          </html>
        `);
        process.exit()
      }
    });
  }

  if (req.query.error) {
    console.log(chalk.red('Something went wrong. Error: '), req.query.error)
    process.exit(1)
  }
})

const main = () => {
  app.listen(PORT, () => {
    console.log(chalk.green(`Listening on ${PROTOCOL}://${HOST}:${PORT}`))
    console.log(chalk.blue('Opening the Spotify Login Dialog in your browser...'))
    open(URL)
  })
}

module.exports = main
