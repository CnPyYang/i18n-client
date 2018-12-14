import React, { Component } from 'react';
import { Modal, Button, Input, Table } from 'antd';
import Request from '../../commons/utils/request';
import './App.less';

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
      jsonsite: '',
      dataSource: [],
      jsonSource: [],
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
    this.json_columns = [
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
        const tmpvalues = Object.entries(res.data.js.pages);
        const jsonTmpvalues = Object.entries(res.data.json.pages);
        const sourse = [];
        const jsonSourse = [];
        for (let i = 0; i < tmpvalues.length; i += 1) {
          const tmp = tmpvalues[i];
          sourse.push({
            pathname: tmp[0],
            url: tmp[1],
            key: `js${i}`,
          })
        }
        for (let i = 0; i < jsonTmpvalues.length; i += 1) {
          const tmp = jsonTmpvalues[i];
          jsonSourse.push({
            pathname: tmp[0],
            url: tmp[1],
            key: `json${i}`,
          })
        }
        this.setState({
          site: res.data.js.site,
          jsonsite: res.data.json.site,
          dataSource: sourse,
          jsonSource: jsonSourse,
          display: '',
        });
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
        <div className="margonbot">
          <Button type="primary" onClick={this.getCdn}>生成CDN</Button>
        </div>
        <div className="margonbot" style={{ display: this.state.display }}>
          <div className="margonbot">主域js的CDN</div>
          <Input id="cdnjsId" readOnly className="cdnInput" value={this.state.site} />
          <Button onClick={() => copyUrl('cdnjsId')}>复制</Button>
          <div className="margontop margonbot">子域js的CDN</div>
          <Table
            dataSource={this.state.dataSource}
            columns={this.columns}
            pagination={false}
            rowClassName="editable-row"
          />
        </div>
        <div className="margontop" style={{ display: this.state.display }}>
          <div className="margonbot">主域json的CDN</div>
          <Input id="cdnjsonId" readOnly className="cdnInput" value={this.state.jsonsite} />
          <Button onClick={() => copyUrl('cdnjsonId')}>复制</Button>
          <div className="margontop margonbot">子域json的CDN</div>
          <Table
            dataSource={this.state.jsonSource}
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
