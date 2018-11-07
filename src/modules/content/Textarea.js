import React, { Component } from 'react';
import { Form, Input, Button, Modal, Row, Col, Select, Icon } from 'antd';
// import axios from 'axios';
import MD5 from '../../assets/md5';

const transLang = [
  { label: '中文', val: 'zh' },
  { label: '繁体中文', val: 'cht' },
  { label: '英语', val: 'en' },
  { label: '法语', val: 'fra' },
  { label: '德语', val: 'de' },
  { label: '日语', val: 'jp' },
  { label: '韩语', val: 'kor' },
  { label: '西班牙语', val: 'spa' },
  { label: '泰语', val: 'th' },
  { label: '阿拉伯语', val: 'ara' },
  { label: '俄语', val: 'ru' },
  { label: '葡萄牙语', val: 'pt' },
  { label: '意大利语', val: 'it' },
  { label: '希腊语', val: 'el' },
  { label: '荷兰语', val: 'nl' },
  { label: '波兰语', val: 'pl' },
  { label: '保加利亚语', val: 'bul' },
  { label: '爱沙尼亚语', val: 'est' },
  { label: '丹麦语', val: 'dan' },
  { label: '芬兰语', val: 'fin' },
  { label: '捷克语', val: 'cs' },
  { label: '罗马尼亚语', val: 'rom' },
  { label: '斯洛文尼亚语', val: 'slo' },
  { label: '瑞典语', val: 'swe' },
  { label: '匈牙利语', val: 'hu' },
  { label: '粤语', val: 'yue' },
  { label: '文言文', val: 'wyw' },
  { label: '越南语', val: 'vie' },
];
const options = [];
for (let i = 0; i < transLang.length; i += 1) {
  options.push(<Select.Option key={transLang[i].val}>{transLang[i].label}</Select.Option>);
}
const width = { width: 100 };
const FormItem = Form.Item;
const appid = '20181101000228793';
const key = 'MTEKytejhqCV4pzfkyZ_';
let from = 'en';
let to = 'zh';
function copyUrl() {
  if (document.execCommand) {
    const tmp = document.getElementById('Copy');
    tmp.select();
    document.execCommand('Copy');
  }
}

class Textarea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      visible: false,
      datatype: '',
      data: [],
      loading: false,
      query: '',
      dst: '',
      from: 'en',
      to: 'zh',
    };
    this.settype = this.settype.bind(this);
    this.test = this.test.bind(this);
    this.fromChange = this.fromChange.bind(this);
    this.toChange = this.toChange.bind(this);
    this.exChange = this.exChange.bind(this);
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

  childFun(datatype, tmpdata) {
    this.setState({ visible: true, datatype, data: tmpdata });
    // this.test();
  }

  test() {
    const that = this;
    const html = '<script>function onBack(r) {sessionStorage.setItem("translate", JSON.stringify(r))}<\/script>';// eslint-disable-line
    const cont = document.getElementById('chrome-content-root');
    cont.innerHTML = html;
    const oldScript = cont.getElementsByTagName('script')[0];
    cont.removeChild(oldScript);
    const newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.innerHTML = oldScript.innerHTML;
    cont.appendChild(newScript);

    const time = new Date().getTime();
    const tmp = appid + this.state.query + time + key;
    const data = `q=${encodeURIComponent(this.state.query)}&from=${this.state.from}&to=${this.state.to}&appid=${appid}&salt=${time}&sign=${MD5(tmp)}`;
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = `http://api.fanyi.baidu.com/api/trans/vip/translate?${data}&callback=onBack`;
    document.head.appendChild(script1);
    cont.innerHTML = '';
    setTimeout(() => {
      const tmpdata = JSON.parse(sessionStorage.getItem('translate'));
      that.setState({ dst: tmpdata.trans_result[0].dst });
    }, 500);
  }

  fromChange(val) {
    from = val;
    this.setState({ from: val });
  }

  toChange(val) {
    to = val;
    this.setState({ to: val });
  }

  exChange() {
    const tmp = from;
    this.setState({ to: from });
    this.setState({ from: to });
    from = to;
    to = tmp;
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
        <Row>
          <Col span={16}>
            <Form onSubmit={e => this.handleSubmit(e)} className="login-form">
              {this.getFields()}
              <FormItem>
                <Button className="login-form-button" type="primary" htmlType="submit" loading={this.state.loading}>
                  提交
                </Button>
                { errTpl }
              </FormItem>
            </Form>
          </Col>
          <Col span={8}>
            <div className="transMa">
              <Select style={width} value={this.state.from} onChange={this.fromChange}>
                {options}
              </Select>
              <Button onClick={this.exChange}><Icon type="swap" theme="outlined" /></Button>
              <Select style={width} value={this.state.to} onChange={this.toChange}>
                {options}
              </Select>
            </div>
            <Input.TextArea rows={4} onChange={e => this.setState({ query: e.target.value })} />
            <Button disabled={this.state.query === ''} onClick={this.test}>翻译</Button>
            <Input.TextArea id="Copy" rows={4} readOnly value={this.state.dst} />
            <Button onClick={copyUrl}>复制</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(Textarea);
