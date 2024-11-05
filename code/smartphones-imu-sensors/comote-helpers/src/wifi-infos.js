import si from 'systeminformation';

/**
 * @typedef {Object} WifiInfos
 * @property {number} ssid - SSID of the WiFi connection
 * @property {number} ip - Related IP (IPV4)
 */

/**
 * Retrieve the SSID and related IP of the first WiFi connection found, return
 * `null` if no WiFi connection found.
 *
 * @async
 * @return {WiFiInfos|null}
 */
export async function getWifiInfos() {
  // find first wifi connection
  const wifiConnections = await si.wifiConnections();
  const conn = wifiConnections[0];

  if (!conn) {
    return null;
  }

  // find related interface
  const interfaces = await si.networkInterfaces();
  const int = interfaces.find(int => int.iface === conn.iface);

  return {
    ssid: conn.ssid,
    ip: int.ip4,
  };
}
