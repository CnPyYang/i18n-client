import React, { Component } from 'react';
import { Form, Input, Button, Modal } from 'antd';

import Request from '../../../commons/utils/request';

import '../App.less';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      visible: false,
      datatype: '',
      data: JSON.parse(sessionStorage.getItem('pagedata')),
    };
  }

  componentWillMount() {
    const tmpDiv = document.querySelectorAll('[data-national]');
    const allNational = [];
    for (let index = 0; index < tmpDiv.length; index += 1) {
      const boo = allNational.some(ele => ele.name === tmpDiv[index].dataset.national);
      if (!boo) {
        allNational.push({ name: tmpDiv[index].dataset.national })
        const div = tmpDiv[index];
        const tmpdata = {
          datatype: div.dataset.national,
        }
        const tmp = document.createElement('span');
        tmp.setAttribute('class', 'redcircle');
        tmp.setAttribute('data-type', tmpdata.datatype);
        tmp.onclick = (ev) => {
          const { dataset } = ev.currentTarget;
          if (dataset.type) {
            this.getData(dataset.type);
          }
        };
        tmp.innerHTML = '<svg viewBox="64 64 896 896" class="" data-icon="form" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M904 512h-56c-4.4 0-8 3.6-8 8v320H184V184h320c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V520c0-4.4-3.6-8-8-8z"></path><path d="M355.9 534.9L354 653.8c-.1 8.9 7.1 16.2 16 16.2h.4l118-2.9c2-.1 4-.9 5.4-2.3l415.9-415c3.1-3.1 3.1-8.2 0-11.3L785.4 114.3c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-415.8 415a8.3 8.3 0 0 0-2.3 5.6zm63.5 23.6L779.7 199l45.2 45.1-360.5 359.7-45.7 1.1.7-46.4z"></path></svg>';
        div.appendChild(tmp);
      }
    }
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  getData(datatype) {
    const data = {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      key: datatype,
    };
    Request.get({
      url: '/kv/item',
      data,
      done: (ele) => {
        const val = ele.data;
        const tmpdata = [];
        const values = JSON.parse(sessionStorage.getItem('pagedata'));
        for (let i = 0; i < values.length; i += 1) {
          const tmp = values[i];
          if (val.length > 0) {
            val.forEach((item) => {
              if (tmp.url_lang_id === item.url_lang_id) {
                tmp.value = item.value;
                tmp.id = item.id;
              }
            })
          }
          tmpdata.push(tmp);
        }
        this.setState({ data: tmpdata, visible: true, datatype })
      },
    });
  }

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < this.state.data.length; i += 1) {
      const tmp = this.state.data[i];
      children.push(
        <FormItem style={{ margin: 0 }} label={`${tmp.name}`} key={i}>
          {getFieldDecorator(`${tmp.lang_id}`, {
            initialValue: tmp.value,
          })(<Input.TextArea rows={3} placeholder={tmp.lang_name} />)}
        </FormItem>,
      );
    }
    return children;
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        this.setState({ errMsg: err });
        return;
      }
      const tmpvalues = Object.entries(values);
      const savedata = [];
      const updatedata = [];
      for (let i = 0; i < tmpvalues.length; i += 1) {
        const tmp = tmpvalues[i];
        const tmpdata = {
          key: this.state.datatype,
          value: tmp[1],
        };
        this.state.data.forEach((item) => {
          if (tmp[0] === item.lang_id.toString()) {
            tmpdata.url_lang_id = item.url_lang_id;
            if (item.id) {
              tmpdata.id = item.id;
              updatedata.push(tmpdata)
            } else {
              savedata.push(tmpdata);
            }
            return false;
          }
          return true;
        })
      }
      if (savedata.length > 0) {
        Promise.all([
          Request.post({ url: '/kv/save', data: { data: savedata, pathname: window.location.pathname } }),
          Request.post({ url: '/kv/update', data: { data: updatedata, pathname: window.location.pathname } }),
        ]).then((val) => {
          console.log(val)
          this.setState({ visible: false });
        })
      } else {
        Request.post({
          url: '/kv/update',
          data: { data: updatedata, pathname: window.location.pathname },
          done: (value) => {
            if (value.errCode) {
              this.setState({ errMsg: value.errMsg });
            } else {
              this.setState({ visible: false });
            }
          },
        });
      }
    });
  }

  render() {
    const { getFieldsError } = this.props.form;
    const { errMsg, visible } = this.state;
    const errTpl = errMsg ? <div className="login-form-explain">{errMsg}</div> : ''
    return (
      <Modal
        title={this.state.dataname}
        footer={null}
        visible={visible}
        width="50%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
          {this.getFields()}
          <FormItem>
            <Button className="login-form-button" type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
              提交
            </Button>
            { errTpl }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(App);
