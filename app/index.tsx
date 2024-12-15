import { Text, View, ScrollView, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Card, Button } from "@rneui/themed";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "@/app/apiService";

export default function Index() {
  useEffect(() => {
    const loadCachedValues = async () => {
      try {
        const cachedIpAddress = await AsyncStorage.getItem("ipAddress");
        const cachedUserId = await AsyncStorage.getItem("userId");
        const cachedPassword = await AsyncStorage.getItem("password");
        const cachedCarrier = await AsyncStorage.getItem("carrier");

        if (cachedIpAddress) setIpAddress(cachedIpAddress);
        if (cachedUserId) setUserId(cachedUserId);
        if (cachedPassword) setPassword(cachedPassword);
        if (cachedCarrier) setCarrier(cachedCarrier);
      } catch (error) {
        console.error("Failed to load cached values", error);
      }
    };

    loadCachedValues();
  }, []);

  const [ipAddress, setIpAddress] = useState("172.21.0.54");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [carrier, setCarrier] = useState("0");

  useEffect(() => {
    const saveCachedValues = async () => {
      try {
        await AsyncStorage.setItem("ipAddress", ipAddress);
        await AsyncStorage.setItem("userId", userId);
        await AsyncStorage.setItem("password", password);
        await AsyncStorage.setItem("carrier", carrier);
      } catch (error) {
        console.error("Failed to save cached values", error);
      }
    };

    saveCachedValues();
  }, [ipAddress, userId, password, carrier]);

  const [status, setStatus] = useState({
    operation: false,
    message: "",
  });
  const [deviceList, setDeviceList] = useState([]);
  const [currentDeviceStatus, setCurrentDeviceStatus] = useState({
    online: false,
    online_ip: "",
    online_mac: "",
    online_session: "",
    online_time: "",
    user_account: "",
    update_ts: "",
  });

  const handleLogin = () => {
    setStatus({
      operation: true,
      message: "登录中...",
    });

    apiService
      .login(
        {
          username: userId,
          password: password,
          networkType: carrier,
        },
        ipAddress
      )
      .then((response) => {
        if (response.success) {
          setStatus({
            operation: false,
            message: "登录成功",
          });
        } else {
          setStatus({
            operation: true,
            message: "登录失败",
          });
        }
      });
  };

  const handleLogout = () => {
    setStatus({
      operation: true,
      message: "登出中...",
    });

    apiService.logout(ipAddress).then((response) => {
      if (response.success) {
        setStatus({
          operation: false,
          message: "登出成功",
        });
      } else {
        setStatus({
          operation: true,
          message: "登出失败",
        });
      }
    });
  };

  const handleDeviceList = async () => {
    apiService
      .getDeviceList({ username: userId }, ipAddress)
      .then((response) => {
        if (response.success) {
          // console.log("设备列表数据:", response);
          const data = response.data.list;
          // console.log(data);
          setDeviceList(
            data.map((item) => {
              return {
                online_ip: item.online_ip,
                online_mac: item.online_mac,
                online_session: item.online_session,
                online_time: item.online_time,
                user_account: item.user_account,
              };
            })
          );
        } else {
          setDeviceList([]);
        }
      });
  };

  const handleCurrentStatus = async () => {
    apiService.getCurrentStatus(ipAddress).then((response) => {
      if (response.success) {
        // console.log("设备列表数据:", response);
        const data = response.data.list[0];
        // console.log(data);
        setCurrentDeviceStatus({
          online: true,
          online_ip: data.online_ip,
          online_mac: data.online_mac,
          online_session: data.online_session,
          online_time: data.online_time,
          user_account: data.user_account,
          update_ts: new Date().toISOString(),
        });
      } else {
        setCurrentDeviceStatus({
          online: false,
          online_ip: "",
          online_mac: "",
          online_session: "",
          online_time: "",
          user_account: "",
          update_ts: new Date().toISOString(),
        });
      }
    });
  };

  useEffect(() => {
    handleCurrentStatus();
  }, [status]);

  return (
    <ScrollView>
      <Card>
        <TextInput
          style={styles.input}
          placeholder="登录页 IP"
          value={ipAddress}
          onChangeText={setIpAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="学号"
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Picker
          selectedValue={carrier}
          style={styles.picker}
          onValueChange={(itemValue) => setCarrier(itemValue)}
        >
          <Picker.Item label="校园网" value="0" />
          <Picker.Item label="中国移动" value="2" />
          <Picker.Item label="中国联通" value="3" />
          <Picker.Item label="中国电信" value="4" />
        </Picker>
        <View style={styles.buttonContainer}>
          <Button
            title="登录"
            onPress={handleLogin}
            color="#4CAF50"
            containerStyle={styles.button}
          />
          <Button
            title="登出"
            onPress={handleLogout}
            color="#FF5722"
            containerStyle={styles.button}
          />
        </View>
        {status.operation && (
          <View style={{ display: "flex", alignItems: "center", padding: 20 }}>
            <Text>{status.message}</Text>
          </View>
        )}
      </Card>
      <Card>
        <Card.Title>当前设备</Card.Title>
        <Card.Divider />
        {currentDeviceStatus.online ? (
          <View style={{ padding: 10 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>设备状态</Text>
              <Text>在线</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>用户账号</Text>
              <Text>{currentDeviceStatus.user_account}</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>IP</Text>
              <Text>{currentDeviceStatus.online_ip}</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>MAC</Text>
              <Text>{currentDeviceStatus.online_mac}</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>在线时间</Text>
              <Text>
                {new Date(currentDeviceStatus.online_time).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <Text>当前设备离线</Text>
        )}
        <Card.Divider style={{ marginVertical: 15 }} />
        <Button
          title="刷新"
          onPress={handleCurrentStatus}
          color="#2196F3"
          containerStyle={styles.buttonLarge}
        />
        <View style={{ display: "flex", alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, justifyContent: "flex-end", marginTop: 10 }}>
            最后更新时间: {new Date(currentDeviceStatus.update_ts).toLocaleString()}
          </Text>
        </View>
      </Card>

      <Card>
        <Card.Title>设备列表</Card.Title>
        <Card.Divider />
        <Button
          title="查询"
          onPress={handleDeviceList}
          color="#2196F3"
          containerStyle={styles.buttonLarge}
        />
        {deviceList.length >= 0 && (
          <>
            <Card.Divider style={{ marginVertical: 20 }} />
            {deviceList.map((item) => (
              <View
                key={item.online_ip}
                style={{
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>IP</Text>
                  <Text>{item.online_ip}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>MAC</Text>
                  <Text>{item.online_mac}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>在线时间</Text>
                  <Text>{new Date(item.online_time).toLocaleString()}</Text>
                </View>
              </View>
            ))}{" "}
          </>
        )}
      </Card>
      <View style={{ height: 20 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    marginBottom: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loginStatus: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  button: {
    width: "48%",
    borderColor: "white",
    borderRadius: 10,
  },
  buttonLarge: {
    width: "100%",
    borderColor: "white",
    borderRadius: 10,
  },
});
