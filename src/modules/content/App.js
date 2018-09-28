import React, { Component } from 'react';
import { Form, Input, Button, Modal } from 'antd';

import Request from '../../commons/utils/request';
// import Cookies from '../../commons/utils/cookies';
// import constants from '../../commons/constants';
// import config from '../../commons/config';
import './App.less';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      visible: true,
      confirmLoading: false,
      data: JSON.parse(window.sessionStorage.getItem('national')),
    };
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < this.props.language.length; i += 1) {
      const tmp = this.props.language[i];
      children.push(
        <FormItem label={`${tmp.name}`} key={i}>
          {getFieldDecorator(`${tmp.id}`)(
            <Input placeholder={tmp.key} />,
          )}
        </FormItem>,
      );
    }
    return children;
  }

  handleOk() {
    this.setState({
      confirmLoading: true,
    });
    setTimeout(() => {
      this.setState({
        visible: false,
        confirmLoading: false,
      });
    }, 2000);
  }

  handleCancel() {
    console.log(this, 'Clicked cancel button');
    this.setState({
      visible: false,
    });
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
          key: this.state.data.datatype,
          lang_id: tmp[0],
          value: tmp[1],
        };
        postdata.push(tmpdata);
      }
      console.log(postdata);
      Request.post({
        url: '/i18n/save',
        data: { data: postdata },
        done: (value) => {
          if (value.errCode) {
            this.setState({ errMsg: value.errMsg });
          }
        },
      });
    });
  }

  render() {
    const { getFieldsError } = this.props.form;
    const { errMsg, visible, confirmLoading } = this.state;

    const errTpl = errMsg ? <div className="login-form-explain">{errMsg}</div> : ''

    return (
      <Modal
        title="Title"
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
      >
        <Input addonBefore="要翻译的内容:" defaultValue={this.state.data.dataname} disabled />
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
