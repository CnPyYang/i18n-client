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
        title: 'name',
        dataIndex: 'name',
        width: '25%',
        editable: false,
      },
      {
        title: 'en',
        dataIndex: '1',
        width: '15%',
        editable: true,
      },
      {
        title: 'ZH-CN',
        dataIndex: '2',
        width: '15%',
        editable: true,
      },
      {
        title: 'ZH-HK',
        dataIndex: '3',
        width: '15%',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    { row => (
                      <Button onClick={() => this.save(row, record.key)}>Save</Button>
                    )}
                  </EditableContext.Consumer>
                </span>
              ) : (
                <Button onClick={() => this.edit(record.key)}>Edit</Button>
              )}
            </div>
          );
        },
      },
    ];
  }

  isEditing(record) {
    return record.key === this.state.editingKey;
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  save(form, key) {
    console.log(this.props.form, key)
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
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
        width="80%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
        />
      </Modal>
    );
  }
}

export default EditableTable;
