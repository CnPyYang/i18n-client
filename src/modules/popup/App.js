import React, { Component } from 'react';

import Login from './modules/login';
import Menus from './modules/menus';
import constants from '../../commons/constants';
import Cookies from '../../commons/utils/cookies';
import './App.less';

const { COOKIE_TOKEN } = constants;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isLogin: false, checkLogin: props.tokenExpired };
  }

  componentWillMount() {
    if (this.state.checkLogin) {
      Cookies.get(COOKIE_TOKEN, (cookie) => {
        const isLogin = cookie && !!cookie.value;
        this.setState({
          isLogin,
        });
      });
    }
  }

  render() {
    const { isLogin } = this.state;
    return (
      <div className="container">
        <div className="module-login">
          <div className="login-title">i18n-v11n</div>
          { !isLogin ? <Login /> : <Menus /> }
        </div>
      </div>
    );
  }
}

export default App;
