import React, { Component } from 'react';
import { Modal, Button, Input, Table } from 'antd';

import Request from '../../commons/utils/request';

function copyUrl(text, ele) {
  const id = text || ele;
  if (document.execCommand) {
    const tmp = document.getElementById(id);
    tmp.select();
    document.execCommand('Copy');
  }
}

class Cdn extends Component {
  constructor() {
    super();
    this.state = {
      visible: true,
      dataname: '页面国际化',
      site: '',
      dataSource: [],
      display: 'none',
    }
    this.columns = [
      {
        title: '路径',
        dataIndex: 'pathname',
        width: 150,
        align: 'center',
      }, {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        render: (text, record) => <div><Input id={record.key} className="cdnInput" readOnly value={record.url} /><Button onClick={() => copyUrl(text, record.key)}>复制</Button></div>,
      },
    ]
    this.getCdn = this.getCdn.bind(this);
  }

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
        this.setState({ site: res.data.site, dataSource: sourse, display: '' });
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
        <div style={{ marginBottom: 10 }}>
          <Button type="primary" onClick={this.getCdn}>生成CDN</Button>
        </div>
        <div style={{ display: this.state.display }}>
          <div style={{ marginBottom: 10 }}>主域CDN</div>
          <Input id="cdnId" readOnly className="cdnInput" value={this.state.site} />
          <Button onClick={() => copyUrl('cdnId')}>复制</Button>

          <div style={{ marginTop: 10 }}>子域CDN</div>
          <Table
            dataSource={this.state.dataSource}
            columns={this.columns}
            pagination={false}
            rowClassName="editable-row"
          />
        </div>
      </Modal>
    );
  }
}

export default Cdn;
