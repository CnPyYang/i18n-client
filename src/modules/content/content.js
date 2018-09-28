// import React from 'react';
// import ReactDOM from 'react-dom';

import { getRootDom, onMessage } from './util';
// import App from './App';

// const contentId = 'chrome-content-root';

onMessage(({ action, data }, sender, response) => { // eslint-disable-line
  switch (action) {
    case 'init':
      window.chromeContentConfig = Object.assign({}, data);
      break;

    default: break;
  }
});
getRootDom();
// sendMessage('i18n_v11n_token');
// injectRootDom(contentId);

// ReactDOM.render(<App />, document.getElementById(contentId));
