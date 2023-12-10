const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

let validGuesses = [];
let hints = [];
let guesses = [];

const GameWindow = (props) => {
    const actions = props.actions.sort((a, b) => a.actionNumber - b.actionNumber).map(action => {
        if (action.action.type === "guess") {
            return <Guess guess={guesses.find(guess => guess.guessNumber === action.action.number)}></Guess>;
        }

        if (action.action.type === "hint") {
            return <Hint hint={hints.find(hint => hint.hintNumber === action.action.number)}></Hint>;
        }
    });

    return (
        <div id="actionList">
            {actions}
        </div>
    );
}

const Guess = (props) => {
    const isTarget = props.guess.isTarget ? "correct" : "far";

    return (
        <div className='guess'>
            <p className='guessNumber'>Guess {props.guess.guessNumber}:</p>
            <h2 className={`albumName closeness-${isTarget}`}>{props.guess.album}</h2>
            <h3 className={`artistName closeness-${props.guess.artist.closeness}`}>{props.guess.artist.value}</h3>
            <div className={`guessBlock year closeness-${props.guess.year.closeness} ${props.guess.year.result}`}>Released <span className='guessBlockValue'>{props.guess.year.value}</span></div>
            <div className={`guessBlock rank closeness-${props.guess.rank.closeness} ${props.guess.rank.result}`}>Rank <span className='guessBlockValue'>{props.guess.rank.value}</span></div>
            <div className={`guessBlock trackCount closeness-${props.guess.trackCount.closeness} ${props.guess.trackCount.result}`}>Track Count <span className='guessBlockValue'>{props.guess.trackCount.value}</span></div>
        </div>
    );
}

const Hint = (props) => {
    return (
        <div className='hint'>
            <p className='hintNumber'>Hint {props.hint.hintNumber}:</p>
            <div className={`guessBlock ${props.hint.attribute} correct`}>${props.hint.value}</div>
        </div>
    );
}

const WinScreen = (props) => {
    const stndrdth = (num) => {
        if (num % 100 >= 10 && num % 100 <= 20) return "th"; // 11th, 12th, 13th
        switch (num % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    const shareResult = () => {
        const text = `I successfully guessed my ${props.guess.rank.value}${stndrdth(props.guess.rank.value)} favorite album ${props.target.album} in today's Rewind.le!`;
        navigator.clipboard.writeText(text);
        document.getElementById('shareSuccess').classList.remove('hidden');
        return;
    }

    return (
        <div id="endScreen">
            <Guess guess={props.guess}></Guess>
            <div id="albumDisplay">
                <img src={`/getLastFm?link=${props.target.art}`} alt={`${props.target.album} album art`} />
                <h2>{props.target.album}</h2>
                <h3>{props.target.artist}</h3>
            </div>
            <a href='/stats'>Go to stats</a>
            <button onClick={shareResult}>Share</button>
            <p id='shareSuccess' className='hidden'>copied to your clipboard!</p>
        </div>
    );
}

const LoseScreen = (props) => {
    return (
        <div id="endScreen">
            <h2>Out of Guesses</h2>
            <div id="albumDisplay">
                <img src={`/getLastFm?link=${props.target.art}`} alt={`${props.target.album} album art`} />
                <h2>{props.target.album}</h2>
                <h3>{props.target.artist}</h3>
            </div>
            <a href='/stats'>Go to stats</a>
        </div>
    );
}

const handleGuessData = (data) => {
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    document.getElementById('actionList').appendChild(actionContainer);

    if (data.guessesLeft === 0 || data.isTarget) {
        document.querySelector('#searchBar > input').setAttribute("disabled", "");
    
        helper.sendGet('/play/target', {}, (target) => {
            document.getElementById('endScreenWrapper').classList.remove("hidden");

            if (data.isTarget) {
                ReactDOM.render(<WinScreen guess={data} target={target}></WinScreen>,
                document.getElementById('endScreenWrapper'));
            } else {
                ReactDOM.render(<LoseScreen target={target}></LoseScreen>,
                document.getElementById('endScreenWrapper'));
            }
        });
    }
    ReactDOM.render(<Guess guess={data}></Guess>, actionContainer);
    document.querySelector('#searchBar > input').removeAttribute('disabled');
}

const submitGuess = (artist, album, mbid) => {
    helper.sendPost('/play/guess', {artist, album, mbid}, handleGuessData);
}

const handleSearchBarSubmit = (e) => {
    e.preventDefault();

    if (!e.nativeEvent.submitter) {
        return false;
    }

    const artist = e.nativeEvent.submitter.dataset.artist;
    const album = e.nativeEvent.submitter.dataset.album;
    const id = e.nativeEvent.submitter.dataset.id;

    ReactDOM.render(
        <SearchBar matchingAlbums={[]}></SearchBar>,
        document.getElementById('searchBarContainer')
    );

    const searchBar = document.querySelector('#searchBar > input');
    searchBar.value = "";
    searchBar.setAttribute("disabled", "");

    submitGuess(artist, album, id);

    return false;
}

const SearchBar = (props) => {
    const handleTextInput = (e) => {
        const text = e.target.value;
        if (text.length < 3) {
            ReactDOM.render(
                <SearchBar matchingAlbums={[]}></SearchBar>,
                document.getElementById('searchBarContainer')
            );
            return;
        }

        const matchingAlbums = validGuesses.filter(album => {
            let albumTrim = album.album.toLowerCase();
            let artistTrim = album.artist.toLowerCase();

            if (albumTrim.substring(0, text.length) === text.toLowerCase()) return true;
            if (artistTrim.substring(0, text.length) === text.toLowerCase()) return true;

            if (albumTrim.startsWith('the ') && albumTrim.split(/^the /)[1].substring(0, text.length) === text.toLowerCase()) return true;
            if (artistTrim.startsWith('the ') && artistTrim.split(/^the /)[1].substring(0, text.length) === text.toLowerCase()) return true;

            return false;
        });

        ReactDOM.render(
            <SearchBar matchingAlbums={matchingAlbums}></SearchBar>,
            document.getElementById('searchBarContainer')
        );
    }

    const searchOptions = props.matchingAlbums.map(album => {
        if (!album.mbid) {
            return <li><input 
                type='submit'
                className='searchOption'
                data-artist={album.artist}
                data-album={album.album}
                value={`${album.artist} - ${album.album}`}
            /></li>
        }

        return <li><input 
            type='submit'
            className='searchOption'
            data-artist={album.artist}
            data-album={album.album}
            data-id={album.mbid}
            value={`${album.artist} - ${album.album}`}
        /></li>
    });

    return (
        <form id='searchBar' onSubmit={handleSearchBarSubmit}>
            <input type='text' onInput={handleTextInput} placeholder='guess an album...'/>
            <ul id='searchOptionList'>
                {searchOptions}
            </ul>
        </form>
    )
}

const handleGameData = (data) => {
    guesses = data.guesses;
    hints = data.hints;
    validGuesses = data.validGuesses;

    ReactDOM.render(
        <GameWindow actions={data.actions}></GameWindow>,
        document.getElementById('content')
    );

    // render search bar
    ReactDOM.render(
        <SearchBar matchingAlbums={[]}></SearchBar>,
        document.getElementById('searchBarContainer')
    );

    if (guesses.length === data.maxGuesses || guesses.at(-1)?.isTarget) {
        document.querySelector('#searchBar > input').setAttribute("disabled", "");
        document.getElementById('endScreenWrapper').classList.remove("hidden");
    
        helper.sendGet('/play/target', {}, (target) => {
            if (guesses.at(-1)?.isTarget) {
                ReactDOM.render(<WinScreen guess={guesses.at(-1)} target={target}></WinScreen>,
                document.getElementById('endScreenWrapper'));
            } else {
                ReactDOM.render(<LoseScreen target={target}></LoseScreen>,
                document.getElementById('endScreenWrapper'));
            }
        });
    }
}

const closeHowToPlay = (e) => {
    const wrapper = document.getElementById('howToPlayWrapper');

    if (e.target == wrapper) {
        wrapper.classList.add('hidden');
    }
}

const init = () => {
    const howToPlay = document.getElementById('howToPlayWrapper');
    document.getElementById('howToPlayButton').addEventListener('click', () => { howToPlay.classList.remove('hidden') });
    window.addEventListener('click', closeHowToPlay);

    helper.sendGet('/play/getGameInfo', {}, handleGameData);
}

window.onload = init;