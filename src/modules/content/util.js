import React from 'react';
import ReactDOM from 'react-dom';
import Request from '../../commons/utils/request';
import constants from '../../commons/constants';
import App from './App';
import EditableTable from './Index';

let language = [];
const allNational = [];
const { COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME } = constants;

const injectRootDom = () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'chrome-content-root');
  document.body.appendChild(div);
  ReactDOM.render(<App language={language} />, document.getElementById('chrome-content-root'));
  const tmpDiv = document.querySelectorAll('[data-national]');
  for (let index = 0; index < tmpDiv.length; index += 1) {
    const allDiv = {
      name: tmpDiv[index].dataset.national,
      htmlName: tmpDiv[index].innerText,
      key: index.toString(),
    };
    language.forEach((item) => {
      allDiv[item.id] = '';
    })
    allNational.push(allDiv);
  }
}

const AllInjectDom = () => {
  const tmp = document.getElementById('chrome-content');
  if (tmp) {
    ReactDOM.unmountComponentAtNode(document.getElementById('chrome-content'));
    tmp.remove();
  }
  const data = {
    url: window.location.protocol + window.location.hostname + window.location.pathname,
  };
  Request.get({
    url: '/i18n/list',
    data,
    done: (val) => {
      // console.log(val)
      // console.log(language)
      // console.log(allNational)
      for (let i = 0; i < allNational.length; i += 1) {
        const item = allNational[i];
        val.forEach((e) => {
          if (item.name === e.key) {
            const el = Object.keys(item);
            el.forEach((a) => {
              if (a === e.lang_id.toString()) {
                item[a] = e.value;
              }
            })
          }
        })
      }
      const div = document.createElement('div');
      div.setAttribute('id', 'chrome-content');
      document.body.appendChild(div);
      ReactDOM.render(<EditableTable data={allNational} language={language} />, document.getElementById('chrome-content'));
    },
  });
}

const sendMessage = (action, data, url, callback = () => {}) => {
  chrome.runtime.sendMessage({ _from: 'content', action, data, url }, (tmp, sender, response) => {
    callback(tmp, sender, response);
  });
}

const contentjs = {
  oneTrans(val) {
    const tmpDiv = document.querySelectorAll('[data-type]');
    for (let index = 0; index < tmpDiv.length; index += 1) {
      const div = tmpDiv[index];
      div.style.display = val;
    }
  },
  onMessage(callback) {
    chrome.runtime.onMessage.addListener((data, sender, response) => {
      callback(data, sender, response);
    });
  },
  listenBakground({ action, data, url }, sender, response) { // eslint-disable-line
    switch (action) {
      default: break;
    }
  },
  listenPopup({ action, data }, sender, response) { // eslint-disable-line
    console.log(action, data)
    switch (action) {
      case 'one': this.oneTrans(data); break;
      case 'all': AllInjectDom(); break;
      default: break;
    }
  },
  listenerCount() {
    this.onMessage(({ _from, action, data, url }, sender, response) => {
      const params = [{ action, data, url }, sender, response];
      if (_from === 'bakground') {
        this.listenBakground(...params);
      } else if (_from === 'popup') {
        this.listenPopup(...params);
      }
    });
  },
}

contentjs.listenerCount();

const getRootDom = () => {
  Request.get({
    url: '/i18n/languages',
    done: (data) => {
      language = data.languages;
      if (data.errCode === 2001) {
        sendMessage('user_token', [COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME], window.location.href);
      } else if (!data.errCode) {
        injectRootDom();
      }
    },
  });
}

export {
  getRootDom,
  sendMessage,
};
