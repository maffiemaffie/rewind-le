const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleAccountSearchResults = (result) => {
    if (result.account) {
        ReactDOM.render(<ConfirmAccountWindow 
                username={result.account.username}
                name={result.account.name}
                accountImageSrc={result.account.image}
            />,
            document.getElementById('content'));
    }
}

const handleSearchAccount = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;

    if (!username) {
        helper.handleError('username required');
        return false;
    }

    helper.sendPost(e.target.action, {username}, handleAccountSearchResults);

    return false;
}

const handleConfirmAccount = (e) => {
    e.preventDefault();
    helper.hideError();

    helper.sendPost(e.target.action, {});

    return false;
}

const EnterUsernameWindow = (props) => {
    return (
        <form id="connectForm"
            name="connectForm"
            onSubmit={handleSearchAccount}
            action="/setLastFmAccount"
            method="POST"
            className="mainForm"
        >
            <h2>Let's find your last.fm account</h2>
            <label htmlFor="user">Username: </label>
            <input type="text" id="user" name="username" placeholder="username" />
            <input type="submit" className="formSubmit" value="Confirm" />
        </form>
    );
};

const ConfirmAccountWindow = (props) => {
    const onNotMeClick = (e) => {
        e.preventDefault();
        ReactDOM.render(<EnterUsernameWindow />,
            document.getElementById('content'));
        return false;
    };

    return (
        <form id="connectConfirmForm"
            name="connectConfirmForm"
            onSubmit={handleConfirmAccount}
            action="/confirmLastFmAccount"
            method="POST"
            className="mainForm"
        >
            <h2>Is this you?</h2>
            <div>
                <img src={props.accountImageSrc} alt={`${props.username}'s profile picture`} id="lastFmAccountImage" />
                <p id='lastFmAccountUsername'>{props.username}</p>
                <p id="lastFmAccountName">{props.name}</p>
            </div>
            <input type="submit" onClick={onNotMeClick} className="formSubmit" value="Yes that's me" />
            <input type="button" value="No, that's not me" />
        </form>
    );
};

const init = () => {
    ReactDOM.render(<EnterUsernameWindow />,
        document.getElementById('content'));
}

window.onload = init;