import React, { Component } from 'react';
import { Form, Input, Button, Modal } from 'antd';

import Request from '../../commons/utils/request';

import './App.less';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class App extends Component {
  constructor(props) {
    super(props);
    const data = [];
    for (let i = 0; i < props.language.length; i += 1) {
      const tmp = this.props.language[i];
      data.push({
        name: tmp.name,
        lang_id: tmp.id,
        lang_name: tmp.key,
        value: '',
      });
    }
    this.state = {
      errMsg: '',
      visible: false,
      datatype: '',
      dataname: '',
      data,
    };
  }

  componentWillMount() {
    const tmpDiv = document.querySelectorAll('[data-national]');
    for (let index = 0; index < tmpDiv.length; index += 1) {
      const div = tmpDiv[index];
      const tmpdata = {
        datatype: div.dataset.national,
        dataname: div.innerHTML,
      }
      const tmp = document.createElement('span');
      tmp.setAttribute('class', 'redcircle');
      tmp.setAttribute('data-type', tmpdata.datatype);
      tmp.setAttribute('data-name', tmpdata.dataname);
      tmp.onclick = (ev) => {
        const { dataset } = ev.currentTarget;
        if (dataset.type && dataset.name) {
          this.getData(dataset.type);
          this.setState({
            datatype: dataset.type,
            dataname: dataset.name,
            visible: true,
          })
        }
      };
      tmp.innerHTML = '<svg viewBox="64 64 896 896" class="" data-icon="form" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M904 512h-56c-4.4 0-8 3.6-8 8v320H184V184h320c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V520c0-4.4-3.6-8-8-8z"></path><path d="M355.9 534.9L354 653.8c-.1 8.9 7.1 16.2 16 16.2h.4l118-2.9c2-.1 4-.9 5.4-2.3l415.9-415c3.1-3.1 3.1-8.2 0-11.3L785.4 114.3c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-415.8 415a8.3 8.3 0 0 0-2.3 5.6zm63.5 23.6L779.7 199l45.2 45.1-360.5 359.7-45.7 1.1.7-46.4z"></path></svg>';
      div.appendChild(tmp);
    }
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  getData(datatype) {
    const data = {
      url: window.location.protocol + window.location.hostname + window.location.pathname,
      key: datatype,
    };
    Request.get({
      url: '/i18n/item',
      data,
      done: (val) => {
        const tmpdata = [];
        for (let i = 0; i < this.state.data.length; i += 1) {
          const tmp = this.state.data[i];
          tmp.value = '';
          val.forEach((item) => {
            if (tmp.lang_id === item.lang_id) {
              tmp.value = item.value;
            }
          })
          tmpdata.push(tmp);
        }
        this.setState({ data: tmpdata })
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
          })(<Input placeholder={tmp.lang_name} />)}
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
      const postdata = [];
      for (let i = 0; i < tmpvalues.length; i += 1) {
        const tmp = tmpvalues[i];
        const tmpdata = {
          url: window.location.protocol + window.location.hostname + window.location.pathname,
          key: this.state.datatype,
          lang_id: Number(tmp[0]),
          value: tmp[1],
        };
        postdata.push(tmpdata);
      }
      Request.post({
        url: '/i18n/save',
        data: { data: postdata },
        done: (value) => {
          if (value.errCode) {
            this.setState({ errMsg: value.errMsg });
          } else {
            this.setState({ visible: false });
          }
        },
      });
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
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
          {this.getFields()}
          <FormItem>
            <Button className="login-form-button" type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
              submit
            </Button>
            { errTpl }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(App);
