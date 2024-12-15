import axios, { AxiosError } from "axios";

export async function login(
  {
    username,
    password,
    networkType,
  }: { username: string; password: string; networkType: string },
  url: string = "172.21.0.54"
) {
  try {
    // 构建登录参数
    const loginParams = {
      callback: "dr1003",
      DDDDD: username,
      upass: password,
      "0MKKey": "123456",
      R1: "0",
      R2: "",
      R3: networkType || "0",
      R6: "0",
      para: "00",
      v6ip: "",
      terminal_type: "1",
      lang: "zh-cn",
      jsVersion: "4.1",
      v: "2653",
    };

    // 构建URL参数字符串
    const queryString = Object.entries(loginParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const loginUrl = `http://${url}/drcom/login?${queryString}`;

    // 发送登录请求
    const response = await axios.get(loginUrl, {
      timeout: 10000, // 增加超时时间到10秒
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
        Accept: "*/*",
        Connection: "keep-alive",
      },
    });

    if (typeof response.data !== 'string') {
      throw new Error('Invalid response format');
    }

    const match = response.data.match(/dr1003\s*\((.*)\)\s*;?/);
    if (!match || !match[1]) {
      throw new Error('Failed to parse response data');
    }

    const dataString = match[1];
    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      throw new Error('Invalid JSON format in response');
    }

    const success = data.result === 1;
    if (!success) {
      throw new Error(data.msg || "Login failed");
    }

    return {
      success: true,
      message: "登录成功",
      data: data,
    };
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: "请求超时，请检查网络连接",
        };
      }
      if (error.response) {
        return {
          success: false,
          message: `服务器错误: ${error.response.status}`,
        };
      }
      if (error.request) {
        return {
          success: false,
          message: "网络请求失败，请检查网络连接",
        };
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "登录失败",
    };
  }
}

export async function logout(url: string = "172.21.0.54") {
  try {
    const logoutUrl = `http://${url}/drcom/logout?callback=dr1006`;
    // 发送登出请求
    const response = await axios.get(logoutUrl, {
      timeout: 10000, // 增加超时时间到10秒
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
        Accept: "*/*",
        Connection: "keep-alive",
      },
    });

    if (typeof response.data !== 'string') {
      throw new Error('Invalid response format');
    }

    const match = response.data.match(/dr1006\s*\((.*)\)\s*;?/);
    if (!match || !match[1]) {
      throw new Error('Failed to parse response data');
    }

    const dataString = match[1];
    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      throw new Error('Invalid JSON format in response');
    }

    const success = data.result === 1;
    if (!success) {
      throw new Error(data.msg || "Logout failed");
    }

    return {
      success: true,
      message: "登出成功",
      data: data,
    };
  } catch (error) {
    console.error('Logout error:', error);
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: "请求超时，请检查网络连接",
        };
      }
      if (error.response) {
        return {
          success: false,
          message: `服务器错误: ${error.response.status}`,
        };
      }
      if (error.request) {
        return {
          success: false,
          message: "网络请求失败，请检查网络连接",
        };
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "登出失败",
    };
  }
}

export async function getCurrentStatus(url: string = "172.21.0.54") {
  try {
    const deviceListUrl = `http://${url}:801/eportal/portal/mac/find?callback=dr1002`;

    // 发送设备列表请求
    const response = await axios.get(deviceListUrl, {
      timeout: 10000, // 增加超时时间到10秒
      headers: {
        Host: `${url}:801`,
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
        Accept: "*/*",
        "Sec-GPC": "1",
        "Accept-Language": "zh-CN,zh",
        Referer: `http://${url}/`,
      },
    });

    if (typeof response.data !== 'string') {
      throw new Error('Invalid response format');
    }

    const match = response.data.match(/dr1002\s*\((.*)\)\s*;?/);
    if (!match || !match[1]) {
      throw new Error('Failed to parse response data');
    }

    const dataString = match[1];
    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      throw new Error('Invalid JSON format in response');
    }

    if (!data.result) {
      throw new Error(data.msg || "Failed to get current status");
    }

    return {
      success: true,
      message: "当前已登录",
      data: data,
    };
  } catch (error) {
    console.error('Get current status error:', error);
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: "请求超时，请检查网络连接",
        };
      }
      if (error.response) {
        return {
          success: false,
          message: `服务器错误: ${error.response.status}`,
        };
      }
      if (error.request) {
        return {
          success: false,
          message: "网络请求失败，请检查网络连接",
        };
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "获取当前状态失败",
    };
  }
}

export async function getDeviceList({ username }: { username: string }, url: string = "172.21.0.54") {
  try {
    const deviceListUrl = `http://${url}:801/eportal/portal/mac/find?callback=dr1002&user_account=${username}`;

    // 发送设备列表请求
    const response = await axios.get(deviceListUrl, {
      timeout: 10000, // 增加超时时间到10秒
      headers: {
        Host: `${url}:801`,
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
        Accept: "*/*",
        "Sec-GPC": "1",
        "Accept-Language": "zh-CN,zh",
        Referer: `http://${url}/`,
      },
    });

    if (typeof response.data !== 'string') {
      throw new Error('Invalid response format');
    }

    const match = response.data.match(/dr1002\s*\((.*)\)\s*;?/);
    if (!match || !match[1]) {
      throw new Error('Failed to parse response data');
    }

    const dataString = match[1];
    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      throw new Error('Invalid JSON format in response');
    }

    if (!data.result) {
      throw new Error(data.msg || "Failed to get device list");
    }

    return {
      success: true,
      message: "设备列表获取成功",
      data: data,
    };
  } catch (error) {
    console.error('Get device list error:', error);
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: "请求超时，请检查网络连接",
        };
      }
      if (error.response) {
        return {
          success: false,
          message: `服务器错误: ${error.response.status}`,
        };
      }
      if (error.request) {
        return {
          success: false,
          message: "网络请求失败，请检查网络连接",
        };
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "获取设备列表失败",
    };
  }
}

const apiService = {
  login,
  logout,
  getCurrentStatus,
  getDeviceList,
};

export default apiService;