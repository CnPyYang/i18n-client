import React, { Component } from 'react';
import { Table, Button } from 'antd';

import { EditableCell, EditableFormRow } from './Table';

const EditableContext = React.createContext();
const data = [];
for (let i = 0; i < 10; i += 1) {
  data.push({
    key: i.toString(),
    name: `Edrward ${i}`,
    age: 3,
    address: `London Park no. ${i}`,
  });
}

class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = { data, editingKey: '' };
    this.columns = [
      {
        title: 'name',
        dataIndex: 'name',
        width: '25%',
        editable: true,
      },
      {
        title: 'age',
        dataIndex: 'age',
        width: '15%',
        editable: true,
      },
      {
        title: 'address',
        dataIndex: 'address',
        width: '40%',
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
                    {form => (
                      <Button onClick={() => this.save(form, record.key)}>Save</Button>
                    )}
                  </EditableContext.Consumer>
                  {/* <EditableContext.Consumer>
                    {<Button onClick={() => this.cancel(record.key)}>Cancel</Button>}
                  </EditableContext.Consumer> */}
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

  cancel() {
    this.setState({ editingKey: '' });
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
      <Table
        components={components}
        bordered
        dataSource={this.state.data}
        columns={columns}
        rowClassName="editable-row"
      />
    );
  }
}

export default EditableTable;
