/**
 * @since 2016-06-05 09:45
 * @author vivaxy
 */

import 'whatwg-fetch';
import nodeUrl from 'url';
import querystring from 'querystring';

import env from './env';
import * as envs from './conf/env';
import * as requestMethods from './conf/requestMethods';
import getRequestPath from './requestPath';
import * as httpStatusCode from './conf/httpStatusCode';
import { FetchError, ServerError, TimeoutError, UnauthorizedError } from './errors';
import sleep from './sleep';

const MOCK_DELAY = 1000;
const SUCCESS_CODE_LOWER_BOUND = 200;
const SUCCESS_CODE_HIGHER_BOUND = 300;
const SERVER_SUCCESS_CODE = 200;
const DEFAULT_TIMEOUT = 60000;

const basicFetchOptions = {
    // credentials: 'same-origin',
    credentials: 'include',  // 允许带上的cookie跨域
};

const sendRequest = async(config) => {

    const {
        method = requestMethods.GET,
        data,
        url,
        mockDelay = MOCK_DELAY,
    } = config;

    let responseJSON = null;
    if (location.hostname === 'mss.vip.sankuai.com' || env === envs.LOCAL || env === envs.DEVELOPMENT) {

        const response = await getMockData(config);
        responseJSON = getResponse(response);

        await sleep(mockDelay);
    } else {

        const fetchOptions = getFetchOptions({
            method,
            data,
            url,
        });
        const {
            requestPath,
            options,
        } = fetchOptions;
        const response = await fetch(requestPath, options);

        responseJSON = getResponse(response);
    }
    return responseJSON;
};

const getMockData = async({
                              method = requestMethods.GET,
                              data,
                              url,
                          }) => {

    const requestPath = getRequestPath(url);

    const context = require.context('../../../mock-server/api', true, /\.js(on)?$/);
    let mockData = null;
    try {
        const mockFunc = context(`.${requestPath}.js`).default;
        mockData = await mockFunc({
            method,
            data,
            url,
        });
    } catch (ex) {
        try {
            mockData = context(`.${requestPath}.json`);
        } catch (e) {
            throw new Error(`404 Not Found：${requestPath}, method: ${method}, data: ${JSON.stringify(data)}`);
        }
    }

    console.groupCollapsed('%c mock-server', 'color: #066');
    console.log(`%c -> ${method}: ${url}`, 'color: #00f', data);
    console.log(`%c <-`, 'color: #00f', mockData);
    console.groupEnd('mock-server');

    return {
        json: () => {
            return mockData;
        },
        status: 200,
    };
};

const getFetchOptions = ({
                             method,
                             data,
                             url,
                         }) => {

    let requestPath = getRequestPath(url);
    let requestMethod = method.toUpperCase();

    const options = {
        method: requestMethod,
        ...basicFetchOptions,
    }
    if (requestMethod === requestMethods.GET) {
        requestPath = nodeUrl.format({
            pathname: requestPath,
            query: data
        });
    } else if (requestMethod === requestMethods.POST) {
        const flatData = Object.keys(data).reduce((obj, key) => {
            const value = data[key];
            if (typeof value === 'object') {
                return { ...obj, [key]: JSON.stringify(value) };
            }
            return { ...obj, [key]: value };
        }, {});
        options.body = querystring.stringify(flatData);
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        };
    }
    return {
        requestPath,
        options,
    };
};

const getResponse = async(response) => {
    if (response.status === httpStatusCode.UNAUTHORIZED) {
        throw new UnauthorizedError(response);
    } else if (response.status < SUCCESS_CODE_LOWER_BOUND || response.status > SUCCESS_CODE_HIGHER_BOUND) {
        throw new FetchError(response);
    } else {
        const resp = await response.json();
        if (resp.code !== SERVER_SUCCESS_CODE) {
            throw new ServerError(resp);
        } else {
            return resp.msg;
        }
    }
};

const timeoutPromise = async(timeout) => {
    await sleep(timeout);
    throw new TimeoutError(timeout);
};

/**
 *
 * @param config
 *  - url
 *  - data
 *  - method
 *  - timeout
 *  - mockDelay
 * @returns {*}
 */
export default async(config) => {

    const {
        timeout = DEFAULT_TIMEOUT,
        ...fetchConfig,
    } = config;

    return await Promise.race([timeoutPromise(timeout), sendRequest(fetchConfig)]);
};
