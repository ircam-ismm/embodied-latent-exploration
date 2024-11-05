import si from 'systeminformation';

/**
 * @typedef {Object} NetworkInterfaces
 * @property {Array.<NetworkInterface>} Interfaces
 */

/**
 * @typedef {Object} NetworkInterface
 *
 * @property {string} iface: - identifier eg. 'en0'
 * @property {string} ifaceName - name eg. 'en0'
 * @property {boolean} default - true if default interface (for sending data)
 * @property {string} ip4 - address eg. '192.168.0.1'
 * @property {string} ip4subnet - eg. '255.255.252.0'
 * @property {string} ip6 eg. 'fe80::456:7890:abcd:ef01'
 * @property {string} ip6subnet eg. 'ffff:ffff:ffff:ffff::'
 * @property {string} type eg. 'wireless' or 'wired'
 *
 * @see https://www.npmjs.com/package/systeminformation
 */

/**
 * @callback interfacaFilterCallback
 * @param {Object} interface network interface to test
 * @return {boolean} true to keep this interface
 */

/**
 * Retrieve information of network interfaces
 *
 * @async
 * @param {Object} options
 * @param {interfacaFilterCallback} options.interfaceFilter callback for filter to test interface
 * @return {NetworkInterfaces|null} null if no interface found
 */
export async function getNetworkInterfacesInfos({
  interfaceFilter = (i) => {
    // only IPv4
    // avoid localhost
    return i.ip4
      && i.ip4 !== '127.0.0.1'
      && i.ip4 !== 'localhost';
  }
}= {}) {
  const interfaces = await si.networkInterfaces();

  if(!interfaces) {
    return null;
  }

  if(typeof interfaceFilter !== 'function') {
    return interfaces;
  }

  return interfaces.filter(interfaceFilter);
}










