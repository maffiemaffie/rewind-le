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
            <h2 className={`albumName ${isTarget}`}>{props.guess.album}</h2>
            <h3 className={`artistName ${props.guess.artist.closeness}`}>{props.guess.artist.value}</h3>
            <div className={`guessBlock year ${props.guess.year.closeness} ${props.guess.year.result}`}>Released <span className='guessBlockValue'>{props.guess.year.value}</span></div>
            <div className={`guessBlock rank ${props.guess.rank.closeness} ${props.guess.rank.result}`}>Rank <span className='guessBlockValue'>{props.guess.rank.value}</span></div>
            <div className={`guessBlock trackCount ${props.guess.trackCount.closeness} ${props.guess.trackCount.result}`}>Track Count <span className='guessBlockValue'>{props.guess.trackCount.value}</span></div>
        </div>
    );
}

const Hint = (props) => {
    return (
        <div className='hint'>
            <div className={`guessBlock ${props.hint.attribute} correct`}>${props.hint.value}</div>
        </div>
    );
}

const handleGuessData = (data) => {
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    document.getElementById('actionList').appendChild(actionContainer);

    ReactDOM.render(<Guess guess={data}></Guess>, actionContainer);
}

const submitGuess = (artist, album, mbid) => {
    helper.sendPost('/play/guess', {artist, album, mbid}, handleGuessData);
}

const handleSearchBarSubmit = (e) => {
    e.preventDefault();

    const artist = e.nativeEvent.submitter.dataset.artist;
    const album = e.nativeEvent.submitter.dataset.album;
    const id = e.nativeEvent.submitter.dataset.id;

    ReactDOM.render(
        <SearchBar matchingAlbums={[]}></SearchBar>,
        document.getElementById('searchBarContainer')
    );

    document.querySelector('#searchBar > input').value = "";

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
            <input type='text' onInput={handleTextInput}/>
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
    )
}

const init = () => {
    helper.sendGet('/play/getGameInfo', {}, handleGameData);
}

window.onload = init;