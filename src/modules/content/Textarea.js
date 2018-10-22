import React, { Component } from 'react';
import { Form, Input, Button, Modal } from 'antd';

import './App.less';

const FormItem = Form.Item;

class Textarea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      visible: false,
      datatype: '',
      data: [],
      loading: false,
      width: '50%',
    };
    this.settype = this.settype.bind(this)
  }

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < this.state.data.length; i += 1) {
      const tmp = this.state.data[i];
      children.push(
        <FormItem style={{ margin: 0 }} label={`${tmp.name}`} key={i}>
          {getFieldDecorator(`${tmp.url_lang_id}`, {
            initialValue: tmp.value,
          })(<Input.TextArea rows={3} />)}
        </FormItem>,
      );
    }
    return children;
  }

  settype() {
    this.setState({ visible: false, loading: false, data: [] })
  }

  childFun(datatype, tmpdata, width) {
    console.log(tmpdata)
    this.setState({ visible: true, datatype, data: tmpdata, width })
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
          if (tmp[0] === item.url_lang_id.toString()) {
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
      this.setState({ loading: true })
      this.props.submit(savedata, updatedata, this.settype);
    });
  }

  render() {
    const errTpl = this.state.errMsg ? <div className="login-form-explain">{this.state.errMsg}</div> : ''
    return (
      <Modal
        title={this.state.datatype}
        footer={null}
        visible={this.state.visible}
        width={this.state.width}
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
          {this.getFields()}
          <FormItem>
            <Button className="login-form-button" type="primary" htmlType="submit" loading={this.state.loading}>
              提交
            </Button>
            { errTpl }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(Textarea);
