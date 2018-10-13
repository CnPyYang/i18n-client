import React, { Component } from 'react';
import { Table, Modal, Button } from 'antd';

import { EditableCell, EditableFormRow } from './Table';
import Request from '../../commons/utils/request';

class EditableTable extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      dataSource: props.data,
      visible: true,
      dataname: '页面国际化',
    };
    this.columns = [
      {
        title: '字段',
        dataIndex: 'htmlName',
        width: '10%',
        editable: false,
      },
    ];
    props.language.forEach((item) => {
      this.columns.push({
        title: item.name,
        dataIndex: item.id.toString(),
        editable: true,
        width: '15%',
      })
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
    const url = window.location.protocol + window.location.hostname + window.location.pathname;
    this.state.dataSource.forEach((item) => {
      const tmpvalues = Object.entries(item);
      for (let i = 0; i < tmpvalues.length - 3; i += 1) {
        const tmp = tmpvalues[i];
        const tmpdata = {
          key: item.name,
          lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        this.props.val.forEach((e) => {
          if (tmpdata.lang_id === e.lang_id && item.name === e.key) {
            tmpdata.id = e.id;
          }
        })
        data.push(tmpdata);
      }
    })
    const iddata = data.filter(val => val.id);
    const noiddata = data.filter(val => !val.id);
    // Request.post({
    //   url: '/i18n/update',
    //   data: { data: iddata, url },
    //   done: () => {
    //     this.setState({ visible: false });
    //   },
    // });
    // Request.post({
    //   url: '/i18n/save',
    //   data: { data: noiddata, url },
    //   done: () => {
    //     this.setState({ visible: false });
    //   },
    // });
    if (noiddata.length > 0) {
      Promise.all([
        Request.post({ url: '/i18n/save', data: { data: noiddata, url } }),
        Request.post({ url: '/i18n/update', data: { data: iddata, url } }),
      ]).then((val) => {
        console.log(val)
        this.setState({ visible: false });
      })
    } else {
      Request.post({
        url: '/i18n/update',
        data: { data: iddata, url },
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
        <Button onClick={this.submit}>提交</Button>
      </Modal>
    );
  }
}

export default EditableTable;
