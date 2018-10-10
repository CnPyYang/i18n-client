import React, { Component } from 'react';
import { Table, Button, Modal } from 'antd';

import { EditableCell, EditableFormRow, EditableContext } from './Table';

// const EditableContext = React.createContext();

class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      editingKey: '',
      visible: true,
      dataname: '页面国际化',
    };
    this.columns = [
      {
        title: '字段',
        dataIndex: 'htmlName',
        width: '25%',
        editable: false,
      },
    ];
    props.language.forEach((item) => {
      this.columns.push({
        title: item.name,
        dataIndex: item.id.toString(),
        width: '15%',
        editable: true,
      })
    })
    this.columns.push({
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => {
        const editable = this.isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <Button onClick={() => this.save(form, record.key)}>保存</Button>
                  )}
                </EditableContext.Consumer>
              </span>
            ) : (
              <Button onClick={() => this.edit(record.key)}>编辑</Button>
            )}
          </div>
        );
      },
    })
  }

  isEditing(record) {
    return record.key === this.state.editingKey;
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      console.log(row)
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ data: newData, editingKey: '' });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }

  submit() {
    console.log(this);
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
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
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
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
        />
        <Button onClick={this.submit(this)}>提交</Button>
      </Modal>
    );
  }
}

export default EditableTable;
