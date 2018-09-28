import React, { Component } from 'react';
import { Menu, Icon } from 'antd';

import constants from '../../../../commons/constants';
import Cookies from '../../../../commons/utils/cookies';

import './index.less';

const { COOKIE_USER_NAME } = constants;
const { SubMenu } = Menu;

class Menus extends Component {
  constructor() {
    super();
    this.state = {
      userName: '',
    };
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
      <div style={{ width: 256 }}>
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
        >
          <Menu.Item key="1">
            <Icon type="pie-chart" />
            <span>{ this.state.userName }</span>
          </Menu.Item>
          <SubMenu key="sub1" title={<span><Icon type="mail" /><span>页面管理</span></span>}>
            <Menu.Item key="2" onClick={this.componentWillMount}>单个翻译</Menu.Item>
            <Menu.Item key="3" onClick={this.componentWillMount}>全部翻译</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
  }
}

export default Menus;
