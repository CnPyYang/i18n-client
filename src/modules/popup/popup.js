import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

let tmptoken = true;
ReactDOM.render(<App tokenExpired={tmptoken} />, document.getElementById('chrome-popup-root'));

const popupjs = {
  sendMessage(action, callback) {
    chrome.runtime.sendMessage({ action }, (data, sender, response) => {
      callback(data, sender, response);
    });
  },

  onMessage(callback) {
    chrome.runtime.onMessage.addListener((data, sender, response) => {
      callback(data, sender, response);
    });
  },

  listenContent({ action, data, url }, sender, response) { // eslint-disable-line
    switch (action) {
      case 'init': break;
      case 'user_token': tmptoken = false; break;
      default: break;
    }
  },

  listenPopup({ action, data }, sender, response) { // eslint-disable-line
    switch (action) {
      default: break;
    }
  },

  listen() {
    this.onMessage(({ _from, action, data, url }, sender, response) => {
      const params = [{ action, data, url }, sender, response];
      if (_from === 'content') {
        this.listenContent(...params);
      } else if (_from === 'background') {
        this.listenPopup(...params);
      }
    });
    return this;
  },
};

popupjs.listen();
