const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username) {
        helper.handleError('username required');
        return false;
    }

    if (!pass) {
        helper.handleError('password required');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});

    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username) {
        helper.handleError('username required');
        return false;
    }

    if (!pass) {
        helper.handleError('password required');
        return false;
    }

    if (!pass2) {
        helper.handleError('please retype password');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});

    return false;
}

const LoginWindow = (props) => {
    const onSignupClick = (e) => {
        e.preventDefault();
        ReactDOM.render(<SignupWindow />,
            document.getElementById('content'));
        return false;
    };

    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="user">Username: </label>
            <input type="text" id="user" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input type="password" id="pass" name="pass" placeholder="password" />
            <input type="submit" className="formSubmit" value="Sign in" />
            <p>No account? <a onClick={onSignupClick} id='signupButton' href="/signup">Sign up</a></p>
        </form>
    );
};

const SignupWindow = (props) => {
    const onLoginClick = (e) => {
        e.preventDefault();
        ReactDOM.render(<LoginWindow />,
            document.getElementById('content'));
        return false;
    };

    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="user">Username: </label>
            <input type="text" id="user" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input type="password" id="pass" name="pass" placeholder="password" />
            <label htmlFor="pass2">Password: </label>
            <input type="password" id="pass2" name="pass2" placeholder="retype password" />
            <input type="submit" className="formSubmit" value="Sign up" />
            <p>Have an account? <a onClick={onLoginClick} id='loginButton' href='/login'>Log in</a></p>
        </form>
    );
};

const init = () => {
    ReactDOM.render(<LoginWindow />,
        document.getElementById('content'));
}

window.onload = init;