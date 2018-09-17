import React, { Component } from 'react';

import Login from './modules/login';
import Menus from './modules/menus';
import constants from '../../commons/constants';
import Cookies from '../../commons/utils/cookies';

import './App.less';

const { COOKIE_TOKEN } = constants;

class App extends Component {
  constructor() {
    super();
    this.state = { isLogin: false, checkLogin: true };
  }

  componentWillMount() {
    Cookies.get(COOKIE_TOKEN, ({ value }) => {
      const isLogin = !!value;
      this.setState({
        isLogin,
        checkLogin: false,
      });
    });
  }

  render() {
    const { isLogin, checkLogin } = this.state;

    return (
      <div className="container">
        <div className="module-login">
          <div className="login-title">i18n-v11n</div>
          { !checkLogin && (!isLogin ? <Login /> : <Menus />) }
        </div>
      </div>
    );
  }
}

export default App;
