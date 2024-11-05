import { WebSocketServer } from 'ws';
import isValidUTF8 from 'utf-8-validate';
import { Server as OscServer } from 'node-osc';
import cloneDeep from 'clone-deep';
import assignDeep from 'assign-deep';

console.log(WebSocket);

/**
 * @typedef {Object} CoMoteConfig
 * @property {String} id - id of the client CoMote
 * @property {Number} interval - period in ms of the sensors for the client CoMote
 * @property {CoMoteTarget} osc - OSC configuration
 * @property {CoMoteTarget} ws - WebSocket configuration
 */

/**
 * @typedef {Object} CoMoteTarget
 * @property {String} hostname - hostname or ip of the WebSocket or OSC server
 * @property {Number} port - listening port of the of the WebSocket or OSC server
 * @property {Boolean} autostart - enable streaming on CoMote application
 */


/**
 * Launch WebSocket and/or OSC server according to given `CoMoteConfig` object
 *
 * @param {CoMoteConfig} config - CoMote configuration
 * @param {Object} options - options
 * @param {Object} [options.verbose=false] - logs debug informations
 */
export class Server {
  constructor(config, options) {
    /**
     * Configuration of the CoMote server
     */
    this.config = cloneDeep(assignDeep({
      id: null,
      interval: null,
      osc: null,
      ws: null,
      verbose: false,
    }, config));

    this._verbose = !!options.verbose;

    if (this._verbose) {
      console.log('+ CoMote config:');
      console.log(this.config, '\n');
    }

    this._websocketServer = null;
    this._oscServer = null;

    this._wsListeners = new Set();
    this._oscListeners = new Set();
  }

  async start() {
    let wsPromise = true;
    let oscPromise = true;

    if (this.config.ws !== null) {
      const { hostname, port } = this.config.ws;

      if (!Number.isInteger(port)) {
        throw new Error(`Invalid port "${port}" for WebSocket server`);
      }

      if (this._verbose) {
        console.log(`> CoMote: Launching WebSocket server on port: ${port}`);
      }

      this._websocketServer = new WebSocketServer({ port });
      this._websocketServer.on('connection', (socket, request) => {
        // const ip = request.socket.remoteAddress;
        socket.on('message', (data, isBinary) => {
          if (isBinary) {
            // @todo
          } else {
            if (isValidUTF8(data)) { // do we really need this check?
              data = JSON.parse(data);

              if (this._verbose) {
                console.log(`> CoMote: new WebSocket message`, data);
              }

              // console.log(data);
              // console.log(this._wsListeners.size);
              this._wsListeners.forEach(listener => listener(data));
            }
          }
        });

        // When a socket closes, or disconnects, remove it from the array.
        socket.on('close', (code, data) => {
          if (this._verbose) {
            console.log('> CoMote: closed socket connection');
          }
        });
      });

      wsPromise = new Promise((resolve, reject) => {
        this._websocketServer.on('listening', () => {
          if (this._verbose) {
            console.log(`> CoMote: WebSocket server listening`);
          }

          resolve();
        });

        this._websocketServer.on('error', err => {
          console.log(`> CoMote: WebSocket server error`, err);
          reject(err);
        });
      });
    }

    if (this.config.osc !== null) {
      const { hostname, port } = this.config.osc;

      if (!Number.isInteger(port)) {
        throw new Error(`Invalid port "${port}" for OSC server`);
      }

      // fallback to broadcast
      if (!hostname) {
        hostname = '0.0.0.0';
      }

      if (this._verbose) {
        console.log(`> CoMote: Launching OSC server udp://${hostname}:${port}`);
      }

      oscPromise = new Promise((resolve, reject) => {
        this._oscServer = new OscServer(this.config.osc.port, hostname, err => {
          if (err) {
            console.log(`> CoMote: OSC server error`, err);
            reject();
            return;
          }

          if (this._verbose) {
            console.log(`> CoMote: OSC server listening`);
          }

          resolve();
        });

        this._oscServer.on('message', data => {
          let address = data.shift();

          if (this._verbose) {
            console.log(`> CoMote: new OSC message "${address}":`, data);
          }

          this._oscListeners.forEach(callback => callback(address, data));
        });
      });
    }

    return Promise.all([wsPromise, oscPromise]);
  }

  async stop() {
    if (this._websocketServer) {
      this._websocketServer.close();
    }

    if (this._oscServer) {
      this._oscServer.close();
    }
  }

    /**
   * Add a listener for incomming WebSocket message
   */
  addWsListener(callback) {
    this._wsListeners.add(callback);

    return () => this._wsListeners.delete(callback);
  }

  /**
   * Remove WebSocket listener
   */
  removeWsListener(callback) {
    this._wsListeners.delete(callback);
  }

  /**
   * Add a listener for incomming OSC message
   */
  addOscListener(callback) {
    this._oscListeners.add(callback);

    return () => this._oscListeners.delete(callback);
  }

  /**
   * Remove OSC listener
   */
  removeOscListener(callback) {
    this._oscListeners.delete(callback);
  }
}
