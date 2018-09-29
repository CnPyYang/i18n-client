import React from 'react';
import ReactDOM from 'react-dom';
import Request from '../../commons/utils/request';
import constants from '../../commons/constants';
import App from './App';

let language = [];
const { COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME } = constants;
const getToken = (value) => {
  // userToken = value;
  console.log(value);
}

const injectRootDom = () => {
  const tmp = document.getElementById('chrome-content-root');
  if (tmp) {
    console.log(tmp);
  } else {
    const div = document.createElement('div');
    div.setAttribute('id', 'chrome-content-root');
    document.body.appendChild(div);
    ReactDOM.render(<App language={language} />, document.getElementById('chrome-content-root'));
  }
}

const sendMessage = (action, data, url, callback = () => {}) => {
  chrome.runtime.sendMessage({ _from: 'content', action, data, url }, (tmp, sender, response) => {
    callback(tmp, sender, response);
  });
}

const onMessage = (callback) => {
  chrome.runtime.onMessage.addListener((data, sender, response) => {
    switch (data.from) {
      case 'language': getToken(data.value); break;
      default: break;
    }
    callback(data, sender, response);
  });
}

// 事件委托，相当于为特殊的span标签添加点击事件
const domTarget = () => {
  const tmp = document.body;
  tmp.addEventListener('click', (ev) => {
    let { target } = ev;
    while (target !== tmp) {
      if (target.tagName && target.tagName.toLowerCase() === 'span') {
        if (target.dataset.type && target.dataset.name) {
          const data = {
            datatype: target.dataset.type,
            dataname: target.dataset.name,
          }
          window.sessionStorage.setItem('national', JSON.stringify(data));
          injectRootDom();
          break;
        }
      }
      target = target.parentNode;
    }
  })
}

// 获取当前页面所有要翻译的dom节点并添加节点span
const getRootDom = () => {
  Request.get({
    url: '/i18n/languages',
    done: (data) => {
      console.log(data)
      language = data.languages;
      if (data.errCode === 2001) {
        sendMessage('user_token', [COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME], window.location.href);
      } else if (!data.errCode) {
        const tmpDiv = document.querySelectorAll('[data-national]');
        for (let index = 0; index < tmpDiv.length; index += 1) {
          const div = tmpDiv[index];
          const tmpdata = {
            datatype: div.dataset.national,
            dataname: div.innerHTML,
          }
          const tmp = document.createElement('span');
          tmp.setAttribute('class', 'redcircle');
          tmp.setAttribute('data-type', tmpdata.datatype);
          tmp.setAttribute('data-name', tmpdata.dataname);
          tmp.innerHTML = '<svg viewBox="64 64 896 896" class="" data-icon="form" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M904 512h-56c-4.4 0-8 3.6-8 8v320H184V184h320c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V520c0-4.4-3.6-8-8-8z"></path><path d="M355.9 534.9L354 653.8c-.1 8.9 7.1 16.2 16 16.2h.4l118-2.9c2-.1 4-.9 5.4-2.3l415.9-415c3.1-3.1 3.1-8.2 0-11.3L785.4 114.3c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-415.8 415a8.3 8.3 0 0 0-2.3 5.6zm63.5 23.6L779.7 199l45.2 45.1-360.5 359.7-45.7 1.1.7-46.4z"></path></svg>';
          div.appendChild(tmp);
        }
        domTarget();
      }
    },
  });
}

export {
  injectRootDom,
  getRootDom,
  sendMessage,
  onMessage,
};
