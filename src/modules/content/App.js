import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

import './App.less';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      errMsg: '',
    }
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        this.setState({ errMsg: err });
        return;
      }
      Request.post({
        url: '/auth/login',
        data: values,
        done: (data) => {
          if (data.errCode) {
            this.setState({ errMsg: data.errMsg });
            // return;
          }
        },
      });
    });
  }

  render() {
    const { getFieldsError } = this.props.form;
    const { errMsg } = this.state;

    const errTpl = errMsg ? <div className="login-form-explain">{errMsg}</div> : ''

    return (
      <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
        <FormItem>
          <Input prefix={<Icon type="string" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="简体中文" />
        </FormItem>
        <FormItem>
          <Input prefix={<Icon type="string" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="简体中文" />
        </FormItem>

        <FormItem>
          <Button className="login-form-button" type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
            Log in
          </Button>
          { errTpl }
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(App);
