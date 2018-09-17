
import axios from 'axios';
import Cookie from 'fe-utils/cookie';

import config from '../config';
import constants from '../constants';

const { baseUrl } = config;
const { COOKIE_TOKEN } = constants;

const request = {
  checkParams(params) {
    if (!params || !params.url) {
      throw new Error('request\'url is missed!');
    }
    return this;
  },

  checkStatus(status) {
    if (status === 401) {
      Cookie.delCookie(COOKIE_TOKEN);
      // window.location.href = '/login';
    }
    return this;
  },

  getHeader() {
    const token = Cookie.getCookie(COOKIE_TOKEN);
    const headers = {};

    if (token) {
      headers['x-access-token'] = token;
    }

    return headers;
  },

  request({ url, method, params = {}, data = {} }) {
    const headers = this.getHeader();

    const transform = (_params) => {
      let ret = ''
      Object.keys(_params).forEach((key) => {
        const item = data[key];
        ret += `${encodeURIComponent(key)}=${item}&`;
      });
      return ret;
    };

    return axios.request({
      method,
      url: `${baseUrl}${url}`,
      params,
      headers,
      data,
      transformRequest: [transform],
      validateStatus: (status) => {
        this.checkStatus(status);
        return status >= 200 && status <= 500 && status !== 404 && status !== 401;
      },
    });
  },

  defaultParamsCallback(response, params) {
    response.then((res) => {
      const { data } = res;

      if (data && data.errCode) {
        console.error(`${res.config.method}\u8BF7\u6C42 err:`, JSON.stringify(data), { url: res.config.url });
      }
      if (params.done) {
        params.done(res.data);
      }
    }).catch((err) => {
      if (!err) {
        if (params.fail) { params.fail('can not catch error!'); }
      } else if (err.response) {
        if (params.fail) { params.fail(err); }
      } else if (err.message) {
        if (params.fail) { params.fail(err); }
      }
    });
    return response;
  },

  post(params) {
    const res = this.checkParams(params).request({
      method: 'post',
      url: params.url,
      data: params.data,
      baseUrl,
    });

    return this.defaultParamsCallback(res, params);
  },

  get(params) {
    const res = this.checkParams(params).request({
      method: 'get',
      url: params.url,
      params: params.data,
      baseUrl,
    });

    return this.defaultParamsCallback(res, params);
  },
};

export default request;
