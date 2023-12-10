const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const { EnterUsernameWindow } = require('./linkAccount.jsx');

const AccountWindow = (props) => {
  return (
    <div id='accountWindow'>
      <h2>Account</h2>
      <form id='updateUsername'>
        <fieldset className='textField' disabled>
          <legend className='hidden'>Username:</legend>
          <label htmlFor='usernameField'>Username</label>
          <input type='text' id='usernameField' name='username'/>
          <input type='submit' id='submitChangeUsername' value='Save Changes'/>
        </fieldset>
        <input type='button' className='editButton' value='Edit' disabled/>
      </form>
      <form id='updatePassword'>
        <fieldset className='textField' disabled>
          <legend className='hidden'>Password</legend>
          <label htmlFor='passwordField'>New Password</label>
          <input type='password' id='passwordField' name='password'/>
          <label htmlFor='oldPasswordField'>Old Password</label>
          <input type='password' id='oldPasswordField' name='oldPassword'/>
          <input type='submit' id='submitChangePassword' value='Save Changes'/>
        </fieldset>
        <input type='button' className='editButton' value='Change Password'/>
      </form>
    </div>
  )
}

const PremiumWindow = (props) => {
  return (
    <div id='premiumWindow'>
      <h2>Get Premium</h2>
      <button id='buyPremium'>Buy</button>
    </div>
  )
}

const LastFmWindow = (props) => {
  return (
    <div id='content'>
      <EnterUsernameWindow/>
    </div>
  )
}

init = () => {
  document.getElementById('lastFmTab').addEventListener('click', () => {
    helper.sendPost('/connectLastFm/removeAccount', {});
    ReactDOM.render(
      <LastFmWindow/>,
      document.getElementById('activePage')
    );
  });

  document.getElementById('accountTab').addEventListener('click', () => {
    ReactDOM.render(
      <AccountWindow/>,
      document.getElementById('activePage')
    );
  });

  document.getElementById('premiumTab').addEventListener('click', () => {
    ReactDOM.render(
      <PremiumWindow/>,
      document.getElementById('activePage')
    );
  });

  ReactDOM.render(
    <AccountWindow/>,
    document.getElementById('activePage')
  );
}

window.onload = init;