import React, { Component } from 'react';
import { Modal, Button, Input, Table } from 'antd';

import Request from '../../commons/utils/request';

class Cdn extends Component {
  constructor() {
    super();
    this.state = {
      visible: true,
      dataname: '页面国际化',
      site: '',
      dataSource: [],
    }
    this.columns = [
      {
        title: '路径',
        dataIndex: 'pathname',
        width: 100,
      }, {
        title: 'cdn地址',
        dataIndex: 'url',
        width: 100,
      }, {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
        render: (text, record) => <a href={record.url}>下载</a>,
      },
    ]
    this.getCdn = this.getCdn.bind(this)
  }
  // render: (text, record) => <Button onClick={() => this.edit(text, record)}>下载</Button>,

  getCdn() {
    Request.post({
      url: '/cdn',
      data: { hostname: window.location.hostname },
      done: (res) => {
        const tmpvalues = Object.entries(res.data.pages);
        const sourse = [];
        for (let i = 0; i < tmpvalues.length; i += 1) {
          const tmp = tmpvalues[i];
          sourse.push({
            pathname: tmp[0],
            url: tmp[1],
            key: i.toString(),
          })
        }
        this.setState({ site: res.data.site, dataSource: sourse });
      },
    })
  }

  handleSubmit() {
    Request.post({
      url: '/kv/update',
      data: { pathname: window.location.pathname },
      done: () => {
        this.setState({ visible: false });
      },
    })
  }

  render() {
    return (
      <Modal
        title={this.state.dataname}
        footer={null}
        visible={this.state.visible}
        width="50%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <div>
          <Input className="cdnInput" placeholder="请点击获取按钮,查询CDN地址" disabled value={this.state.site} />
          <Button type="primary" onClick={this.getCdn}>获取</Button>
        </div>
        <Table
          bordered
          dataSource={this.state.dataSource}
          columns={this.columns}
          rowClassName="editable-row"
        />
      </Modal>
    );
  }
}

export default Cdn;
