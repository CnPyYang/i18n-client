import React, { Component } from 'react';
import { Table, Modal, Button } from 'antd';

import Textarea from './Textarea'
import Request from '../../commons/utils/request';

class EditableTable extends Component {
  constructor() {
    super();
    this.state = {
      dataSource: JSON.parse(sessionStorage.getItem('showdata')),
      visible: true,
      dataname: '页面国际化',
      pagedata: JSON.parse(sessionStorage.getItem('pagedata')),
    }
    this.columns = [
      {
        title: '字段',
        dataIndex: 'name',
        width: 100,
        editable: false,
        // fixed: 'left',
      },
    ];
    this.state.pagedata.forEach((item) => {
      this.columns.push({
        title: item.name,
        dataIndex: item.url_lang_id.toString(),
        editable: true,
        width: 200,
      })
    })
    this.columns.push({
      title: '编辑',
      dataIndex: 'operation',
      width: 100,
      // fixed: 'right',
      render: (text, record) => <Button onClick={() => this.edit(text, record)}>Edit</Button>,
    })
    this.submit = this.submit.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  edit(datatype, data) { // 编辑按钮弹窗
    const tmpvalues = Object.entries(data);
    const postdata = [];
    let str = '';
    for (let i = 0; i < tmpvalues.length; i += 1) {
      const tmp = tmpvalues[i];
      if (Number(tmp[0])) {
        const tmpdata = {
          name: data.name,
          url_lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        const rawdata = JSON.parse(sessionStorage.getItem('rawdata'));
        const pagedata = JSON.parse(sessionStorage.getItem('pagedata'));
        for (let j = 0; j < rawdata.length; j += 1) {
          if (tmpdata.url_lang_id === rawdata[j].url_lang_id && data.name === rawdata[j].key) {
            tmpdata.id = rawdata[j].id;
            if (pagedata.some(ele => ele.lang_name === 'en-us' && ele.url_lang_id === tmpdata.url_lang_id)) {
              str = tmpdata.value;
            }
            break;
          }
        }
        postdata.push(tmpdata);
      }
    }
    this.formRef.childFun(data.name, postdata, str);
  }

  submit(savedata, updata, callback) {
    const values = savedata.length === 0 ? updata : savedata;
    const tmpdata = this.state.dataSource;// eslint-disable-line
    for (let index = 0; index < tmpdata.length; index += 1) {
      const val = tmpdata[index];
      if (val.name === values[0].key) {
        values.forEach((e) => {
          Object.keys(val).forEach((a) => {
            if (a === e.url_lang_id.toString()) {
              val[a] = e.value;
            }
          })
        })
        callback();
        break;
      }
    }
    this.setState({ dataSource: tmpdata })
  }

  handleSubmit() {
    const data = [];
    const rawdata = JSON.parse(sessionStorage.getItem('rawdata'));
    this.state.dataSource.forEach((item) => {
      const tmpvalues = Object.entries(item);
      for (let i = 0; i < tmpvalues.length - 2; i += 1) {
        const tmp = tmpvalues[i];
        const tmpdata = {
          key: item.name,
          lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        rawdata.forEach((e) => {
          if (tmpdata.lang_id === e.lang_id && item.name === e.key) {
            tmpdata.id = e.id;
          }
        })
        data.push(tmpdata);
      }
    })
    const iddata = data.filter(val => val.id);
    const noiddata = data.filter(val => !val.id);
    if (noiddata.length > 0) {
      Promise.all([
        Request.post({ url: '/kv/save', data: { data: noiddata, pathname: window.location.pathname } }),
        Request.post({ url: '/kv/update', data: { data: iddata, pathname: window.location.pathname } }),
      ]).then(() => {
        this.setState({ visible: false });
      })
    } else {
      Request.post({
        url: '/kv/update',
        data: { data: iddata, pathname: window.location.pathname },
        done: () => {
          this.setState({ visible: false });
        },
      });
    }
  }

  render() {
    return (
      <Modal
        title={this.state.dataname}
        footer={null}
        visible={this.state.visible}
        width="60%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Table
          bordered
          dataSource={this.state.dataSource}
          columns={this.columns}
          rowClassName="editable-row"
        />
        <div className="ant-btn-right">
          <Button className="login-form-button" type="primary" onClick={this.handleSubmit}>提交</Button>
        </div>
        <Textarea submit={this.submit} wrappedComponentRef={(e) => { this.formRef = e }} />
      </Modal>
    );
  }
}

export default EditableTable;
