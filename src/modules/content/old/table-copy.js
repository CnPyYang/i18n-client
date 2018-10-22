import React, { Component } from 'react';
import { Table, Modal, Button } from 'antd';

import { EditableCell, EditableFormRow } from './Table';
import Request from '../../../commons/utils/request';

class EditableTable extends Component {
  constructor() {
    super();
    console.log(JSON.parse(sessionStorage.getItem('showdata')))
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
        width: `${(100 / (this.state.pagedata.length + 2))}%`,
        editable: false,
      },
    ];
    this.state.pagedata.forEach((item) => {
      this.columns.push({
        title: item.name,
        dataIndex: item.url_lang_id.toString(),
        editable: true,
        width: `${(100 / (this.state.pagedata.length + 2))}%`,
      })
    })
    this.columns.push({
      title: '编辑',
      dataIndex: 'operation',
      width: `${(100 / (this.state.pagedata.length + 2))}%`,
      render: record => <div><a href="/#" onClick={() => this.edit(record.key)}>Edit</a></div>,
    })
    this.handleSave = this.handleSave.bind(this)
    this.submit = this.submit.bind(this)
  }

  handleSave(row) {
    const newData = this.state.dataSource;// eslint-disable-line
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  }

  submit() {
    const data = [];
    const rawdata = JSON.parse(sessionStorage.getItem('rawdata'));
    this.state.dataSource.forEach((item) => {
      const tmpvalues = Object.entries(item);
      for (let i = 0; i < tmpvalues.length - 3; i += 1) {
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
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
      <Modal
        title={this.state.dataname}
        footer={null}
        visible={this.state.visible}
        width="60%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Table
          components={components}
          bordered
          dataSource={this.state.dataSource}
          columns={columns}
          rowClassName="editable-row"
        />
        <div className="ant-btn-right">
          <Button className="login-form-button" type="primary" onClick={this.submit}>提交</Button>
        </div>
      </Modal>
    );
  }
}

export default EditableTable;
