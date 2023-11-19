# API Docs

# Creating an Account and Logging In

## Fetching the login page
#### `GET /login`  
Supplies the login webpage.

### Middleware
#### Requires Secure
Redirects to HTTPS.

#### Requires Logout
Redirects an authenticated user to the app.

### HTTP Status Codes
Status Code|Description
-|-
200|The page has been successfully sent
302|User is already logged in or client is using an insecure connection

## Logging into an existing account
#### `POST /login`  
Authenticates a registered user to use the application.

### Middleware
#### Requires Secure
Redirects to HTTPS.

#### Requires Logout
Redirects a logged in user to the app.

### Body Parameters
#### `username` (string)
The username to login with.

#### `pass` (string)
The password to login with.

### Example Response (200)
```json
{
    "redirect": "/play"
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|User has successfully been logged in
302|User is already logged in or client is using an insecure connection
400|Missing fields
401|Incorrect username or password

## Creating an account
#### `POST /signup`
Creates a new account with the provided username and password.

### Middleware
#### Requires Secure
Redirects to HTTPS.

#### Requires Logout
Redirects an authenticated user to the app.

### Body Parameters
#### `username` (string)
The username of the new account.

#### `pass` (string)
The password of the new account.

#### `pass2` (string)
Verify password by retyping it.

### Example Response (201)
```json
{
    "redirect": "/connectLastFm"
}
```

### HTTP Status Codes
Status Code|Description
-|-
201|Account created successfully
302|User is already logged in or client is using an insecure connection
400|Missing fields, passwords don't match, or username already exists
502|Last.fm error

# Connecting a Last.fm account to your Rewind.le account

## Fetching the Last.fm connection page
#### `GET /connectLastFm`
Supplies the webpage for linking a Last.fm account to your Rewind.le account.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires No Last.fm Connected
Redirects a user with a Last.fm connection to the app.

### HTTP Status Codes
Status Code|Description
-|-
200|The page has been successfully sent

## Searching for a Last.fm account
#### `POST /connectLastFm/setAccount`
Searches for the desired Last.fm account before confirming the connection.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires No Last.fm Connected
Redirects a user with a Last.fm connection to the app.

## Body Parameters
#### `username` (string)
The username of the Last.fm account.

### Example Response (200)
```json
{
    "realname": "elia",
    "username": "himaffie",
    "image": "https://lastfm.freetls.fastly.net/i/u/174s/b5b2765a9efe535ae743a43064f56872.png",
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|Account found
302|User is not logged in or already has a Last.fm account linked
400|Missing username
502|Last.fm error

## Confirming the Last.fm connection
#### `POST /connectLastFm/confirmAccount`
Confirms the Last.fm account is correct.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires No Last.fm Connected
Redirects a user with a Last.fm connection to the app.

### Example Response (200)
```json
{
    "redirect": "/play"
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|Account successfully connected
302|User is not logged in or already has a Last.fm account linked
502|Last.fm error

## Fetch the app page
#### `GET /play`
Supplies the webpage for the application.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires Last.fm Connection
Redirects a user with no Last.fm connection to connect a Last.fm account.

### HTTP Status Codes
Status Code|Description
-|-
200|The page has been successfully sent
302|User is not logged in or has no Last.fm account linked

# Playing Today's Rewind.le
## Decoding the game info object
The game info object is split into four main parts:
- Info about guesses that can be made
- Info about guesses that were made
- Any hints that have been used
- Each guess and hint in order

Let's look at each part.

### Guesses that can be made
Contains a list of every album that can be guessed and the maximum number of incorrect guesses a user can make before the game ends.

```json
"validGuesses": [
    { "artist": "Crumb", "album": "Ice Melt" },
    { "artist": "Radiohead", "album": "OK Computer" },
    { "artist": "Radiohead", "album": "In Rainbows" },
    { "artist": "The Strokes", "album": "Comedown Machine" },
    { "artist": "Lorde", "album": "Pure Heroine" },
    // ...
],
"maxGuesses": 10
```

#### `validGuesses` (list)
A list of all possible guesses.

<details>
<summary>show children</summary>

#### `validGuesses[n].artist` (string)
The album's artist.

#### `validGuesses[n].album` (string)
The name of the album.

</details>

#### `maxGuesses` (number)
The maximum number of incorrect guesses before the game ends.

### Guesses that were made
Contains a list of every guess a user has already made and the outcome of each guess.

```json
"guesses": [
    {
        "guessNumber": 1,
        "album": "Is This It",
        "artist": {
            "value": "The Strokes",
            "closeness": "correct"
        },
        "year": {
            "value": 2006,
            "result": "tooLow",
            "closeness": "far"
        },
        "trackCount": {
            "value": 14,
            "result": "tooHigh",
            "closeness": "far"
        },
        "rank": {
            "value": 7,
            "result": "tooLow",
            "closeness": "close"
        }
    },
    // ...
],
```

#### `guessNumber` (number)
The order in which each guess was made.

#### `album` (string)
The name of the guessed album.

#### `artist` (object)
The guessed album's artist.
<details>
<summary>show children</summary>

#### `artist.value` (string)
The artist of the guessed album.

#### `artist.closeness` (`"correct"|"close"|"far"`)
How similar the guessed artist is to the target album's artist.

</details>

#### `year` (object)
The guessed album's release year.
<details>
<summary>show children</summary>

#### `year.value` (number)
The year of the guessed album.

#### `year.result` (`"tooLow"|"correct"|"tooHigh"`)
- `"tooLow"` if the guessed album was released in the years prior to the target album.
- `"tooHigh"` if the guessed album was released in the years after the target album.
- `"correct"` if the guessed album was released in the same year as the target album.

#### `year.closeness` (`"correct"|"close"|"far"`)
- `"close"` if the guessed album was released within 5 years of the target album.
- `"far"` if the guessed album was not released within 5 years of the target album.
- `"correct"` if the guessed album was released in the same year as the target album.

</details>


#### `trackCount` (object)
The guessed album's track count.
<details>
<summary>show children</summary>

#### `trackCount.value` (number)
The number of tracks in the guessed album.

#### `trackCount.result` (`"tooLow"|"correct"|"tooHigh"`)
- `"tooLow"` if the guessed album has fewer tracks than the target album.
- `"tooHigh"` if the guessed album has more tracks than the target album.
- `"correct"` if the guessed album has the same number of tracks as the target album.

#### `trackCount.closeness` (`"correct"|"close"|"far"`)
- `"close"` if the guessed album's track count is within 2 tracks of the target album's track count.
- `"far"` if the guessed album's track count is not within 2 tracks of the target album's track count.
- `"correct"` if the guessed album has the same number of tracks as the target album.

</details>


#### `rank` (object)
The guessed album's rank in the users top played albums.

<details>
<summary>show children</summary>

#### `rank.value` (number)
The rank of the guessed album.

#### `rank.result` (`"tooLow"|"correct"|"tooHigh"`)
- `"tooLow"` if the guessed album was played less than the target album.
- `"tooHigh"` if the guessed album was played more than the target album.
- `"correct"` if the guessed album has the same rank as the target album.

#### `rank.closeness` (`"correct"|"close"|"far"`)
- `"close"` if the guessed album's rank is within 5 of the target album's rank.
- `"far"` if the guessed album's rank is not within 5 of the target album's rank.
- `"correct"` if the guessed album has the same rank as the target album.

</details>

### Hints that have been used
Contains a list of every hint used so far.

```json
"hints": [
    {
        "attribute": "trackCount",
        "value": 11
    },
    // ...
],
```

#### `attribute` (`"year"|"trackCount"|"rank"`)
The attribute revealed by the hint.

#### `value` (number)
The value of the revealed attribute.

### Guesses and hints in order
Contains a list of each action taken by the player.

```json
"actions": [
        {
            "actionNumber": 1,
            "action": {
                "type": "guess",
                "guessNumber": 1
            }
        },
        {
            "actionNumber": 2,
            "action": {
                "type": "hint",
                "hintNumber": 1
            }
        },
        // ...
    ]
```

#### `actionNumber` (number)
The order in which each action was taken.

#### `action` (object)

<details>
<summary>show children</summary>

#### `action.type` (`"guess"|"hint"`)
Whether the guess was a guess or a hint.

#### `action.hintNumber` (number)
Used to identify which hint was used in this action.

#### `action.guessNumber` (number)
Used to identify which guess was made in this action.

</details>


## Fetch the data for today's game
#### `GET /play/getGameInfo`
supplies today's valid guesses and the guesses that have been made so far.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires Last.fm Connection
Redirects a user with no Last.fm connection to connect a Last.fm account.

### Example Response (200)
```json
{
    "validGuesses": [
        { "artist": "Crumb", "album": "Ice Melt" },
        { "artist": "Radiohead", "album": "OK Computer" },
        { "artist": "Radiohead", "album": "In Rainbows" },
        { "artist": "The Strokes", "album": "Comedown Machine" },
        { "artist": "Lorde", "album": "Pure Heroine" },
        // ...
    ],
    "maxGuesses": 10,
    "guesses": [
        {
            "guessNumber": 1,
            "album": "Is This It",
            "artist": {
                "value": "The Strokes",
                "closeness": "correct"
            },
            "year": {
                "value": 2006,
                "result": "tooLow",
                "closeness": "far"
            },
            "trackCount": {
                "value": 14,
                "result": "tooHigh",
                "closeness": "far"
            },
            "rank": {
                "value": 7,
                "result": "tooLow",
                "closeness": "close"
            }
        },
        // ...
    ],
    "hints": [
        {
            "attribute": "trackCount",
            "value": 11
        },
        // ...
    ],
    "actions": [
        {
            "actionNumber": 1,
            "action": {
                "type": "guess",
                "guessNumber": 1
            }
        },
        {
            "actionNumber": 2,
            "action": {
                "type": "hint",
                "hintNumber": 1
            }
        },
        // ...
    ]
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|Game data has been successfully sent
302|User is not logged in or has no Last.fm account linked
502|Last.fm error

## Submitting a guess
#### `POST /play/guess`
Makes a guess in the current game of Rewind.le.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires Last.fm Connection
Redirects a user with no Last.fm connection to connect a Last.fm account.

### Body Parameters
#### `artist` (string)
The guessed album's artist.

#### `album` (string)
The name of the album.

### Example Response (200)
```json
{
    "guessNumber": 1,
    "album": "Is This It",
    "artist": {
        "value": "The Strokes",
        "closeness": "correct"
    },
    "year": {
        "value": 2006,
        "result": "tooLow",
        "closeness": "far"
    },
    "trackCount": {
        "value": 14,
        "result": "tooHigh",
        "closeness": "far"
    },
    "rank": {
        "value": 7,
        "result": "tooLow",
        "closeness": "close"
    }
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|Guess was successfully submitted
302|User is not logged in or has no Last.fm account linked
400|Missing or invalid guess
502|Last.fm error

## Using a hint
#### `POST /play/hint`
Uses a hint to reveal one album attribute. User can use up to 3 hints per game.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### Example Response (200)
```json
{
    "attribute": "trackCount",
    "value": 11
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|Hint was successfully used
302|User is not logged in
403|No more hints available

# Accessing User Stats
## The stats data object
The stats object is split into two parts:
- All time stats
- All completed games

Let's look at each part.

### All time stats
Compiles all games into a set of all-time stats.
```json
"allTime": {
    "wins": 25,
    "losses": 10,
    "breakdown": [
        { "guesses": 1, "frequency": 0 },
        { "guesses": 2, "frequency": 1 },
        { "guesses": 3, "frequency": 3 },
        { "guesses": 4, "frequency": 10 },
        // ... 
    ]
},
```
#### `wins` (number)
The number of games the user has correctly guessed the target.

#### `losses` (number)
The number of games the user failed to guess the target in the allotted guesses.

#### `breakdown` (list)
Sorts the wins by how many guesses the user made.

<details>
<summary>show children</summary>

#### `breakdown[n].guesses` (number)
The number of guesses made to achieve a win.

#### `breakdown[n].frequency` (number)
The number of games won with the respective number of guesses.

</details>

### Completed Games
Contains a detailed recount of every completed game.

```json
"completedGames": [
    {
        "date": "2023-11-19",
        "target": {
            "album": "Pure Heroine",
            "artist": "Lorde",
            "year": 2013,
            "trackCount": 10,
            "rank": 5
        },
        "outcome": "won",
        "guesses": [
            // guesses object from game data
        ],
        "hints": [
            // hints object from game data
        ],
        "actions": [
            // actions object from game data
        ]
    },
    // ...
]
```

#### date (string)
The date the game took place in the format `year-month-day`.

#### target (object)

<details>
<summary>show children</summary>

#### `target.album` (string)
The name of the target album.

#### `target.artist` (string)
The target album's artist

#### `target.year` (number)
The target album's release year

#### `target.trackCount` (number)
The target album's track count

#### `target.rank` (number)
The target album's rank by user plays

</details>

#### outcome (`"won"|"lost"`)
The outcome of the game.

#### guesses (object)
Uses the same [guesses object](#guesses-that-were-made) as the [game info object](#decoding-the-game-info-object).

#### hints (object)
Uses the same [hints object](#hints-that-have-been-used) as the [game info object](#decoding-the-game-info-object).

#### actions (object)
Uses the same [actions object](#guesses-and-hints-in-order) as the [game info object](#decoding-the-game-info-object).

## Fetching the stats page
#### `GET /stats`
Supplies the user stats webpage.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### HTTP Status Codes
Status Code|Description
-|-
200|The page has been successfully sent
302|User is not logged in

## Fetching user stats data
#### `GET /getStats`
Supplies the stats for the logged in user.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### Example Response (200)
```json
{
    "allTime": {
        "wins": 25,
        "losses": 10,
        "breakdown": [
            { "guesses": 1, "frequency": 0 },
            { "guesses": 2, "frequency": 1 },
            { "guesses": 3, "frequency": 3 },
            { "guesses": 4, "frequency": 10 },
            // ... 
        ]
    },

    "completedGames": [
        {
            "date": "2023-11-19",
            "target": {
                "album": "Pure Heroine",
                "artist": "Lorde",
                "year": 2013,
                "trackCount": 10,
                "rank": 5
            },
            "outcome": "won",
            "guesses": [
                {
                    "guessNumber": 1,
                    "album": "Is This It",
                    "artist": {
                        "value": "The Strokes",
                        "closeness": "correct"
                    },
                    "year": {
                        "value": 2006,
                        "result": "tooLow",
                        "closeness": "far"
                    },
                    "trackCount": {
                        "value": 14,
                        "result": "tooHigh",
                        "closeness": "far"
                    },
                    "rank": {
                        "value": 7,
                        "result": "tooLow",
                        "closeness": "close"
                    }
                },
                // ...
            ],
            "hints": [
                {
                    "attribute": "trackCount",
                    "value": 11
                },
                // ...
            ],
            "actions": [
                {
                    "actionNumber": 1,
                    "action": {
                        "type": "guess",
                        "guessNumber": 1
                    }
                },
                {
                    "actionNumber": 2,
                    "action": {
                        "type": "hint",
                        "hintNumber": 1
                    }
                },
                // ...
            ]
        },
        // ...
    ]
}
```

### HTTP Status Codes
Status Code|Description
-|-
200|The stats have been successfully sent
302|User is not logged in

# User settings and purchase history 

## Fetching the settings page
#### `GET /settings`
Supplies the webpage with user settings and purchase history.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### HTTP Status Codes
Status Code|Description
-|-
200|The page has been successfully sent
302|User is not logged in

## Changing account password
#### `POST /settings/user/updatePassword`

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires Secure
Redirects to HTTPS.

### Body Parameters
#### `newPassword` (string)
The new password.

#### `oldPassword` (string)
The old password.

### HTTP Status Codes
Status Code|Description
-|-
204|Password has been successfully changed
302|User is not logged in or client is using an insecure connection
400|Missing field
403|Incorrect password

## Upgrading to Rewind.le Premium 
#### `POST /premium/enroll`
Upgrades a user to Rewind.le's paid Premium plan.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

#### Requires Secure
Redirects to HTTPS.

### HTTP Status Codes
Status Code|Description
-|-
204|User has been successfully upgraded
302|User is not logged in or client is using an insecure connection
422|User is already enrolled in premium
>This endpoint would have body parameters and error codes if the application were to accept actual payment.

## Canceling a Premium Membership
#### `POST /premium/cancel`
Cancels a user's Rewind.le Premium plan.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### HTTP Status Codes
Status Code|Description
-|-
204|Plan has been successfully canceled
302|User is not logged in or client is using an insecure connection
404|User is not enrolled in premium

## Signing out of an account
#### `POST /logout`
Logs out the current user.

### Middleware
#### Requires Login
Redirects an unauthenticated user to log in.

### HTTP Status Codes
Status Code|Description
-|-
302|Redirects user to the login page