import React, { Component } from 'react';
import { message } from 'antd';

const tmp = '';

class Err extends Component {
  constructor(props) {
    super(props);
    message.error(props.err);
  }

  render() {
    return <div>{tmp}</div>;
  }
}

export default Err;
