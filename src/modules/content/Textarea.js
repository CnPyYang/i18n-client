import React, { Component } from 'react';
import { Form, Input, Button, Modal } from 'antd';

import './App.less';

const FormItem = Form.Item;
const baseSrc = 'https://fanyi.baidu.com/';

class Textarea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      visible: false,
      datatype: '',
      data: [],
      loading: false,
      src: baseSrc,
    };
    this.settype = this.settype.bind(this)
    this.setvalue = this.setvalue.bind(this)
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
          })(<Input.TextArea rows={3} onBlur={this.setvalue} />)}
        </FormItem>,
      );
    }
    return children;
  }

  setvalue(e) {
    if (e.target.id === '18') {
      this.setState({ src: `${baseSrc}#en/zh/${e.target.value}` })
    } else {
      this.setState({ src: `${baseSrc}#zh/en/${e.target.value}` })
    }
  }

  settype() {
    this.setState({ visible: false, loading: false, data: [] })
  }

  childFun(datatype, tmpdata, src) {
    this.setState({ visible: true, datatype, data: tmpdata, src: `${baseSrc}#en/zh/${src}` })
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
        width="80%"
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
        <iframe src={this.state.src} className="iframe-dispaly" title="translate" />
      </Modal>
    );
  }
}

export default Form.create()(Textarea);
