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
        width: 150,
        align: 'center',
        fixed: 'left',
      },
    ];
    this.state.pagedata.forEach((item) => {
      this.columns.push({
        title: `${item.name}(${item.lang_name})`,
        dataIndex: item.url_lang_id.toString(),
        align: 'center',
        width: 200,
      })
    })
    this.columns.push({
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (text, record) => <Button onClick={() => this.edit(text, record)}>编辑</Button>,
    })
    this.submit = this.submit.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  edit(datatype, data) { // 编辑按钮弹窗
    const tmpvalues = Object.entries(data);
    const rawdata = JSON.parse(sessionStorage.getItem('rawdata'));
    const pagedata = JSON.parse(sessionStorage.getItem('pagedata'));
    const postdata = [];
    for (let i = 0; i < tmpvalues.length; i += 1) {
      const tmp = tmpvalues[i];
      if (Number(tmp[0])) {
        const tmpdata = {
          url_lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        for (let j = 0; j < rawdata.length; j += 1) {
          if (tmpdata.url_lang_id === rawdata[j].url_lang_id && data.name === rawdata[j].key) {
            tmpdata.id = rawdata[j].id;
            break;
          }
        }
        for (let j = 0; j < pagedata.length; j += 1) {
          if (tmpdata.url_lang_id === pagedata[j].url_lang_id) {
            tmpdata.name = `${pagedata[j].name}(${pagedata[j].lang_name})`;
            break;
          }
        }
        postdata.push(tmpdata);
      }
      postdata.sort((val1, val2) => val2.url_lang_id - val1.url_lang_id);
    }
    this.formRef.childFun(data.name, postdata);
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
          url_lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        rawdata.forEach((e) => {
          if (tmpdata.url_lang_id === e.url_lang_id && item.name === e.key) {
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
          dataSource={this.state.dataSource}
          columns={this.columns}
          pagination={false}
          rowClassName="editable-row"
          scroll={{ x: 1000 }}
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
