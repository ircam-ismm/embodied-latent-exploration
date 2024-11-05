import { html, render, nothing } from 'lit';
import * as CoMoteQRCode from '../../../../src/qrcode.js';

let wifiInfos = null;
let networkInfos = null;
let comoteConfig = null;
let qrCode = null;

const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
  console.log("Websocket opened");
};

socket.onmessage = async (event) => {
  const msg = JSON.parse(event.data);
  const { type, payload } = msg;

  switch (type) {
    case "wifiInfos":
      wifiInfos = payload;
      break;
    case "comoteConfig":
      comoteConfig = payload;
      console.log(comoteConfig);
      qrCode = await CoMoteQRCode.dataURL(comoteConfig);
      break;
    case "networkInfos":
      networkInfos = payload;
      break;
    default:
      console.warn("received unknown message", { type, payload });
      break;
  }
  renderApp();
};

socket.onclose = (event) => console.log(`connection closed`);
socket.onerror = (error) => console.log(`[error] ${error.message}`);

function selectNetworkInterface(networkInterface) {
  comoteConfig.osc.hostname = networkInterface;
  const msg = JSON.stringify({ type: "comoteConfig", payload: comoteConfig });
  console.log(typeof msg, "msg = ", msg);
  socket.send(msg);
}

function updateWebviewURL(url) {
  comoteConfig.webview = url;
  const msg = JSON.stringify({ type: "comoteConfig", payload: comoteConfig });
  console.log(typeof msg, "msg = ", msg);
  socket.send(msg);
}

function renderApp() {
  if (!qrCode) {
    render(html`
      <p style="margin-left: 30px">loading...</p>
    `, document.body);
  } else {
    render(html`
      <div style="margin-left: 30px">
        <div>Id: ${comoteConfig.id}</div>
        <div>Sensors sample period: ${comoteConfig.interval} ms</div>

        <select
          name="networkNetworkInterface"
          @change=${e => selectNetworkInterface(e.target.value)}
        >
          ${networkInfos.map((iface) => html`
            <option
              value=${iface.ip4}
            >${iface.ifaceName} (${iface.type}) ${iface.ip4}</option>
          `)}
        </select>

        ${wifiInfos && wifiInfos.ip === comoteConfig.osc.hostname
          ? html`<div>WiFi SSID: ${wifiInfos.ssid}</div>`
          : nothing
        }
        <div>OSC IP: ${comoteConfig.osc.hostname}</div>
        <div>OSC Port: ${comoteConfig.osc.port}</div>
        <div>OSC autostart: ${comoteConfig.osc.autostart ? 1 : 0}</div>
        <div>Webview:
          <input
            type="text"
            .value="${comoteConfig.webview}"
            @change=${e => updateWebviewURL(e.target.value)}
          />
        </div>
      </div>
      <div>
        <img
          style="image-rendering: pixelated; margin: 0; "
          src="${qrCode}"
          width="300"
          height="300"
        />
      </div>
    `, document.body);
  }
}

renderApp();
