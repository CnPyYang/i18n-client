import React, { Component } from 'react';
import { Form, Checkbox, Modal, Popconfirm, message, Button } from 'antd';

import Request from '../../commons/utils/request';

const CheckboxGroup = Checkbox.Group;
let Lang = [];
let List = [];
let add = [];
let del = [];
class Language extends Component {
  constructor(props) {
    super(props);
    Lang = [];
    List = [];
    add = [];
    del = [];
    props.allLang.forEach((element) => { Lang.push(element.name) })
    props.theLang.forEach((element) => { List.push(element.name) })
    this.state = {
      List,
      visible: true,
      Title: '未修改内容，请确定',
    };
    this.onChange = this.onChange.bind(this)
    this.Submit = this.Submit.bind(this)
  }

  onChange(checkedList) {
    this.setState({
      List: checkedList,
    });

    const adddata = [];
    const deldata = [];
    const nowdata = [];
    const addname = [];
    const delname = [];
    checkedList.forEach((ele) => {
      this.props.allLang.forEach((val) => {
        if (ele === val.name) {
          nowdata.push(val);
          return false;
        }
        return true
      })
    })
    nowdata.forEach((ele) => {
      const boo = this.props.theLang.some(val => ele.id === val.lang_id)
      if (boo) {
        addname.push(ele.name)
        adddata.push({ lang_id: ele.id, hostname: window.location.hostname })
      }
    })
    this.props.theLang.forEach((ele) => {
      const boo = nowdata.some(val => ele.lang_id === val.id)
      if (boo) {
        delname.push(ele.name)
        deldata.push(ele.id)
      }
    })
    add = adddata;
    del = deldata;
    let str = '未修改内容，请确定';
    if (addname.length > 0 && delname.length > 0) {
      str = `你确定新增 （ ${addname.join(',')} ） 删除 （ ${delname.join(',')} ）吗?`;
    } else if (addname.length > 0 && delname.length === 0) {
      str = `你确定新增 （ ${addname.join(',')} ）吗?`;
    } else {
      str = `你确定删除 （ ${delname.join(',')} ） 吗?`;
    }
    this.setState({ Title: str });
  }

  savesession() {
    const postdata = {
      hostname: window.location.hostname,
    };
    Request.get({
      url: '/urlang/list',
      data: postdata,
      done: (val) => {
        const data = [];
        for (let index = 0; index < val.data.length; index += 1) {
          const ele = val.data[index];
          const language = JSON.parse(sessionStorage.getItem('language'));
          language.forEach((e) => {
            if (ele.lang_id === e.id) {
              data.push({
                name: e.name,
                lang_name: e.key,
                lang_id: ele.lang_id,
                url_lang_id: ele.id,
              })
              return false;
            }
            return true;
          })
        }
        data.sort((val1, val2) => val1.lang_id - val2.lang_id); // 本页语言按lang_id排序
        sessionStorage.setItem('pagedata', JSON.stringify(data));
        console.log(this, data)
      },
    })
  }

  Submit() {
    if (this.state.List.length === 0) {
      message.error('至少选择一门语言');
      return;
    }
    Promise.all([
      Request.post({ url: '/urlang/add', data: { data: add } }),
      Request.post({ url: '/urlang/del', data: { data: del } }),
    ]).then(() => {
      message.success('修改成功');
      this.setState({ visible: false });
      this.savesession();
    })
  }

  render() {
    return (
      <Modal
        title="语言管理"
        footer={null}
        visible={this.state.visible}
        width="30%"
        onCancel={() => { this.setState({ visible: false }) }}
      >
        <CheckboxGroup options={Lang} value={this.state.List} onChange={this.onChange} />
        <br />
        <div className="ant-btn-right">
          <Popconfirm title={this.state.Title} onConfirm={this.Submit} okText="确定" cancelText="取消">
            {/* <a href="/#">提交</a> */}
            <Button className="login-form-button" type="primary">提交</Button>
          </Popconfirm>
        </div>
      </Modal>
    );
  }
}

export default Form.create()(Language);
