const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const { EnterUsernameWindow } = require('./linkAccount.jsx');

let username;
let hasPremium;

const handleUpdatePassword = (data) => {
  if (!data.error) {
    document.querySelector('#updatePassword > .textField').setAttribute('disabled', '');
    document.querySelector('#updatePassword > .editButton').setAttribute('disabled', '');
  }
}

const AccountWindow = (props) => {
  const changePassword = (e) => {
    document.querySelector('#updatePassword > .textField').removeAttribute('disabled');
    e.target.setAttribute('disabled', '');
  };

  const submitChangePassword = (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('passwordField').value;
    const oldPassword = document.getElementById('oldPasswordField').value;

    helper.sendPost('/settings/user/updatePassword', { newPassword, oldPassword }, handleUpdatePassword);

    return false;
  }

  return (
    <div id='accountWindow'>
      <h2>Account</h2>
      <form id='updateUsername'>
        <fieldset className='textField' disabled>
          <legend className='hidden'>Username:</legend>
          <label htmlFor='usernameField'>Username</label>
          <input type='text' id='usernameField' name='username' value={props.username}/>
          <input type='submit' id='submitChangeUsername' value='Save Changes'/>
        </fieldset>
        <input type='button' className='editButton' value='Edit' disabled/>
      </form>
      <form id='updatePassword'
        onSubmit={submitChangePassword}>
        <fieldset className='textField' disabled>
          <legend className='hidden'>Password</legend>
          <label htmlFor='passwordField'>New Password</label>
          <input type='password' id='passwordField' name='password'/>
          <label htmlFor='oldPasswordField'>Old Password</label>
          <input type='password' id='oldPasswordField' name='oldPassword'/>
          <input type='submit' id='submitChangePassword' value='Save Changes'/>
        </fieldset>
        <input type='button' className='editButton' onClick={changePassword} value='Change Password'/>
      </form>
    </div>
  );
};

const buyPremium = () => {
  helper.sendPost('/premium/enroll', {}, () => {
    hasPremium = true;
    ReactDOM.render(
      <PremiumWindow/>,
      document.getElementById('activePage')
    );
  });
};

const cancelPremium = () => {
  hasPremium = false;
  helper.sendPost('/premium/cancel', {}, () => {
    ReactDOM.render(
      <PremiumWindow/>,
      document.getElementById('activePage')
    );
  });
};

const PremiumWindow = (props) => {
  const BuyPremiumWindow = (props) => {
    return (
      <div id='buyPremiumWindow'>
        <h2>Get Premium</h2>
        <button onClick={buyPremium} id='buyPremium'>Buy</button>
      </div>
    );
  };

  const CancelPremiumWindow = (props) => {
    return (
      <div id='cancelPremiumWindow'>
        <h2>Welcome to <span className='site-title'>Rewind.le</span> Premium!</h2>
        <button onClick={cancelPremium} id='cancelPremium'>Cancel Plan</button>
      </div>
    );
  };

  const BuyHintsWindow = (props) => {
    const buyHints = (amount) => {
      helper.sendPost('/premium/buyHints', { amount }, result => {
        if (result.error) {
          return document.getElementById('buyResult').innerText = "Purchase could not be made at this time.";
        }
        return document.getElementById('buyResult').innerText = "Hints puchased succesfully";
      });
    };

    return (
      <div id='buyHintsWindow'>
        <h3>Buy Hints</h3>
        <button onClick={() => buyHints(5)} className='buyHintButton' id='fiveHintsButton'>Buy Five Hints</button>
        <button onClick={() => buyHints(3)} className='buyHintButton' id='threeHintsButton'>Buy Three Hints</button>
        <button onClick={() => buyHints(1)} className='buyHintButton' id='oneHintButton'>Buy One Hint</button>
        <p id='buyResult'></p>
      </div>
    )
  }

  if (hasPremium) return (
  <div id='premiumWindow'>
    <CancelPremiumWindow/>
    <BuyHintsWindow/>
  </div>);
  return (
  <div id='premiumWindow'>
    <BuyPremiumWindow/>
    <BuyHintsWindow/>
  </div>);
}

const LastFmWindow = (props) => {
  return (
    <div id='content'>
      <EnterUsernameWindow/>
    </div>
  );
};

init = async () => {
  await helper.sendGet('/accountInfo', {}, data => {
    console.log(data);
    username = data.username;
    hasPremium = data.hasPremium;
  });

  document.getElementById('lastFmTab').addEventListener('click', () => {
    helper.sendPost('/connectLastFm/removeAccount', {});
    ReactDOM.render(
      <LastFmWindow/>,
      document.getElementById('activePage')
    );
  });

  document.getElementById('accountTab').addEventListener('click', () => {
    ReactDOM.render(
      <AccountWindow username={username}/>,
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
    <AccountWindow username={username}/>,
    document.getElementById('activePage')
  );
};

window.onload = init;