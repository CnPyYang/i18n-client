import React, { Component } from 'react';

import constants from '../../../../commons/constants';
import Cookies from '../../../../commons/utils/cookies';

import './index.less';

const { COOKIE_USER_NAME } = constants;

class Menus extends Component {
  constructor() {
    super();
    this.state = { userName: '' };
  }

  componentWillMount() {
    Cookies.get(COOKIE_USER_NAME, ({ value }) => {
      this.setState({
        userName: value,
      });
    });
  }

  render() {
    return (
      <div className="user-container">user_name: { this.state.userName }</div>
    );
  }
}

export default Menus;
