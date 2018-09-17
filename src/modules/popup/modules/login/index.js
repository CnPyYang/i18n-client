import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

import Request from '../../../../commons/utils/request';
import Cookies from '../../../../commons/utils/cookies';
import constants from '../../../../commons/constants';
import config from '../../../../commons/config';

import './index.less';

const { COOKIE_TOKEN, COOKIE_USER_ID, COOKIE_USER_NAME } = constants;
const { host } = config;
const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Login extends Component {
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

          // 传给 content 去保存
          Cookies.multiSet([
            [COOKIE_TOKEN, data.access_token, `.${host}`],
            [COOKIE_USER_ID, data.user.id.toString(), `.${host}`],
            [COOKIE_USER_NAME, values.username, `.${host}`],
          ], () => {
            console.log('menu start');
          });
        },
      });
    });
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    const { errMsg } = this.state;

    // Only show error after a field is touched.
    const usernameError = isFieldTouched('username') && getFieldError('userName');
    const passwordError = isFieldTouched('password') && getFieldError('password');

    const errTpl = errMsg ? <div className="login-form-explain">{errMsg}</div> : ''

    return (
      <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
        <FormItem
          validateStatus={usernameError ? 'error' : ''}
          help={usernameError || ''}
        >
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />,
          )}
        </FormItem>

        <FormItem
          validateStatus={passwordError ? 'error' : ''}
          help={passwordError || ''}
        >
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />,
          )}
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

export default Form.create()(Login);
