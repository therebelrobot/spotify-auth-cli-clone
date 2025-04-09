# Spotify CLI Authentication
A tiny helper tool that can be used to quickly fetch a Spotify access token from with the command line.

### Installation
```
$ npm install -g spotify-oauth-cli
```

### Usage
To retrieve an access token run the following command:

```
$ spotify-access-token
```

This will open the Spotify Login dialog in your default browser. After confirming, the window will close itself and if successful, you should see an access token in your console.

### Options
Several options are available when running the `spotify-access-token` command. Two are required: `clientId`, and `clientSecret`

#### ClientId and ClientSecret
You can obtain your `clientId` and `clientSecret` by creating an application on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

The `--clientId` and `--clientSecret` options are required to authenticate your application.

example:
```
$ spotify-access-token --clientId <REDACTED> --clientSecret <REDACTED>
```

#### Redirect URI options
By default, the redirect URI will be set to `http://127.0.0.1:4815/callback` (Spotify doesn't allow http for `localhost`.). If you need something different or more secure, you can change this, with the `--redirectUri` option followed by your desired URI, or specify the PROTOCOL, HOST, and PORT.

examples:
```
$ spotify-access-token --clientId <REDACTED> --clientSecret <REDACTED> --redirectUri https://your-proxied-url.com/callback

$ spotify-access-token --clientId <REDACTED> --clientSecret <REDACTED> --protocol https --host your-proxied-url.com --port 443
```

#### Scope
The `--scope` option can be used to specify the scopes you wish to access. For ease of use, this tool will by default request access to ALL available scopes, so use this option to limit that.

Enter the scope as a comma separated list.
```
$ spotify-access-token --scope user-read-private,playlist-modify-private --clientId <REDACTED> --clientSecret <REDACTED>
```

#### Show Dialog
Add the `--showDialog` flag to prevent the Spotify Login dialog from automatically granting the request after you've already logged in once. Add this flag if you want to switch Spotify user.
