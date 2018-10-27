import React from 'react';
import ReactDOM from 'react-dom';
import Request from '../../commons/utils/request';
import constants from '../../commons/constants';
import App from './App';
import EditableTable from './Index';
import Err from './Err';
import Language from './Lang';
import Cdn from './Cdn';

let language = [];
const allNational = [];
const { COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME } = constants;

// 单个翻译
const injectRootDom = () => {
  const postdata = {
    hostname: window.location.hostname,
  };
  // 获取本站点的语言
  Request.get({
    url: '/urlang/list',
    data: postdata,
    done: (val) => {
      const data = [];
      for (let index = 0; index < val.data.length; index += 1) {
        const ele = val.data[index];
        language.forEach((e) => {
          if (ele.lang_id === e.id) {
            data.push({
              name: e.name,
              lang_name: e.key,
              lang_id: ele.lang_id,
              url_lang_id: ele.id,
              value: '',
            })
            return false;
          }
          return true;
        })
      }
      data.sort((val1, val2) => val1.lang_id - val2.lang_id); // 本页语言按lang_id排序
      sessionStorage.setItem('pagedata', JSON.stringify(data));// 本站点的语言类型存到本地

      const div = document.createElement('div');
      div.setAttribute('id', 'chrome-content-root');
      document.body.appendChild(div);
      ReactDOM.render(<App />, document.getElementById('chrome-content-root'));

      const tmpDiv = document.querySelectorAll('[data-national]');// 全部翻译所需要的数据
      for (let index = 0; index < tmpDiv.length; index += 1) {
        const boo = allNational.some(ele => ele.name === tmpDiv[index].dataset.national);
        if (!boo) {
          const allDiv = {
            name: tmpDiv[index].dataset.national,
            key: index.toString(),
          };
          data.forEach((item) => {
            allDiv[item.url_lang_id] = '';
          })
          allNational.push(allDiv);
        }
      }
    },
  })
}
// 管理语言
const menegeLang = () => {
  const tmp = document.getElementById('chrome-content-lang');
  if (tmp) {
    ReactDOM.unmountComponentAtNode(document.getElementById('chrome-content-lang'));
    tmp.remove();
  }
  const data = {
    hostname: window.location.hostname,
  };
  Request.get({
    url: '/urlang/list',
    data,
    done: (val) => {
      for (let index = 0; index < val.data.length; index += 1) {
        const ele = val.data[index];
        language.forEach((e) => {
          if (ele.lang_id === e.id) {
            ele.name = e.name;
            return false;
          }
          return true;
        })
      }
      const div = document.createElement('div');
      div.setAttribute('id', 'chrome-content-lang');
      document.body.appendChild(div);
      ReactDOM.render(<Language allLang={language} theLang={val.data} />, document.getElementById('chrome-content-lang'));
    },
  });
}
// 全部翻译
const AllInjectDom = () => {
  const tmp = document.getElementById('chrome-content');
  if (tmp) {
    ReactDOM.unmountComponentAtNode(document.getElementById('chrome-content'));
    tmp.remove();
  }
  const data = {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  };
  Request.get({
    url: '/kv/list',
    data,
    done: (ele) => {
      const val = ele.data;
      for (let i = 0; i < allNational.length; i += 1) {
        const item = allNational[i];
        val.forEach((e) => {
          if (item.name === e.key) {
            const el = Object.keys(item);
            el.forEach((a) => {
              if (a === e.url_lang_id.toString()) {
                item[a] = e.value;
              }
            })
          }
        })
      }
      sessionStorage.setItem('showdata', JSON.stringify(allNational))
      sessionStorage.setItem('rawdata', JSON.stringify(val))
      const div = document.createElement('div');
      div.setAttribute('id', 'chrome-content');
      document.body.appendChild(div);
      ReactDOM.render(<EditableTable />, document.getElementById('chrome-content'));
    },
  });
}

const menegeCdn = () => {
  const tmp = document.getElementById('chrome-content-cdn');
  if (tmp) {
    ReactDOM.unmountComponentAtNode(document.getElementById('chrome-content-cdn'));
    tmp.remove();
  }
  const data = {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  };
  Request.get({
    url: '/kv/list',
    data,
    done: (ele) => {
      const val = ele.data;
      for (let i = 0; i < allNational.length; i += 1) {
        const item = allNational[i];
        val.forEach((e) => {
          if (item.name === e.key) {
            const el = Object.keys(item);
            el.forEach((a) => {
              if (a === e.url_lang_id.toString()) {
                item[a] = e.value;
              }
            })
          }
        })
      }
      sessionStorage.setItem('showdata', JSON.stringify(allNational))
      sessionStorage.setItem('rawdata', JSON.stringify(val))
      const div = document.createElement('div');
      div.setAttribute('id', 'chrome-content-cdn');
      document.body.appendChild(div);
      ReactDOM.render(<Cdn />, document.getElementById('chrome-content-cdn'));
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
    switch (action) {
      case 'one': this.oneTrans(data); break;
      case 'all': AllInjectDom(); break;
      case 'language': menegeLang(); break;
      case 'cdn': menegeCdn(); break;
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
    url: '/languages',
    done: (data) => {
      if (data.errCode === 2001) {
        sendMessage('user_token', [COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME], window.location.href);
        const div = document.createElement('div');
        div.setAttribute('id', 'chrome-err');
        document.body.appendChild(div);
        ReactDOM.render(<Err err={data.errMsg} />, document.getElementById('chrome-err'));
      } else if (!data.errCode) {
        language = data.languages;
        sessionStorage.setItem('language', JSON.stringify(language))
        injectRootDom();
      }
    },
  });
}

export {
  getRootDom,
  sendMessage,
};
// showdata 全部翻译数据展示的数据 rawdata 全部翻译数据原始的数据 pagedata 本页面要翻译的语言  language 所有语言的种类
