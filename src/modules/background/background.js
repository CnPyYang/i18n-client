import { initContent } from './senders';
import Cookies from '../../commons/utils/cookies';

const noop = () => {};
const backgroundjs = {
  sendMessage(action, callback = noop) {
    chrome.runtime.sendMessage({ action }, (data, sender, response) => {
      callback(data, sender, response);
    });
  },

  onMessage(callback = noop) {
    chrome.runtime.onMessage.addListener((data, sender, response) => {
      callback(data, sender, response);
    });
  },

  removeCookie(data, url) {
    Cookies.allRemove(data, url);
    this.sendMessage('relogin');
  },

  listenContent({ action, data, url }, sender, response) { // eslint-disable-line
    switch (action) {
      case 'init': initContent(); break;
      case 'user_token': this.removeCookie(data, url); break;
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
      } else if (_from === 'popup') {
        this.listenPopup(...params);
      }
    });
    return this;
  },
};

backgroundjs.listen();
