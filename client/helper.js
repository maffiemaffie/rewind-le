/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleError = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('message').classList.remove('hidden');
};
  
/* Sends post requests to the server using fetch. Will look for various
    entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  let result = {};
  if (response.status !== 204) result = await response.json();
  document.getElementById('message').classList.add('hidden');

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }

  if(handler) {
    handler(result);
  }
};

/* Sends post requests to the server using fetch. Will look for various
    entries in the response JSON object, and will handle them appropriately.
*/
const sendGet = async (url, query, handler) => {
  const queryString = Object.entries(query).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');

  const response = await fetch(`${url}?${queryString}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const result = await response.json();
  document.getElementById('message').classList.add('hidden');

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }

  if(handler) {
    handler(result);
  }
};

const hideError = () => {
  document.getElementById('message').classList.add('hidden');
};

module.exports = {
  handleError,
  sendPost,
  sendGet,
  hideError,
};