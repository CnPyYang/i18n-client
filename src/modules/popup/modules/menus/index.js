import React, { Component } from 'react';
import { Menu, Icon } from 'antd';

import constants from '../../../../commons/constants';
import Cookies from '../../../../commons/utils/cookies';

const { COOKIE_USER_NAME } = constants;
const { SubMenu } = Menu;
let display = 'none';
function sendMess(action, data, callback) {
  let tabId = '';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      tabId = tabs[0].id
    } else {
      return;
    }
    chrome.tabs.sendMessage(tabId, { _from: 'popup', action, data }, () => {
      callback();
    });
  });
}

class Menus extends Component {
  constructor() {
    super();
    this.state = {
      userName: '',
    };
    this.onetranslate = this.onetranslate.bind(this);
  }

  componentWillMount() {// eslint-disable-line
    Cookies.get(COOKIE_USER_NAME, ({ value }) => {
      this.setState({
        userName: value,
        transName: '页面翻译(隐藏)',
      });
    });
  }

  onetranslate() {
    const action = 'one';
    const data = display;
    sendMess(action, data, () => {
      if (data === 'none') {
        display = '';
      } else {
        display = 'none';
      }
    });
    if (data === 'none') {
      this.setState({ transName: '页面翻译(显示)' });
    } else {
      this.setState({ transName: '页面翻译(隐藏)' });
    }
  }

  alltranslate() {// eslint-disable-line
    const action = 'all';
    const data = true;
    sendMess(action, data, () => {});
  }

  menegelang() {// eslint-disable-line
    const action = 'language';
    const data = true;
    sendMess(action, data, () => {});
  }

  cdn() {// eslint-disable-line
    const action = 'cdn';
    const data = true;
    sendMess(action, data, () => {});
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
          <SubMenu key="sub1" title={<span><Icon type="mail" /><span>管理</span></span>}>
            <Menu.Item key="2" onClick={this.onetranslate}>{this.state.transName}</Menu.Item>
            <Menu.Item key="3" onClick={this.alltranslate}>全部翻译</Menu.Item>
            <Menu.Item key="4" onClick={this.menegelang}>语言管理</Menu.Item>
            <Menu.Item key="5" onClick={this.cdn}>CDN配置</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
  }
}

export default Menus;
