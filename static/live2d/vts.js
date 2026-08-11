"use strict";

/* VTube Studio Public API client. */
window.PLVTS = (function () {
  const LS_TOKEN = "yumeno:vts:token";
  const LS_URL = "yumeno:vts:url";
  const DEFAULT_URL = "ws://127.0.0.1:8001";
  const LEGACY_DEFAULT_URL = "ws://127.0.0.1:8001/api";
  const SEND_INTERVAL_MS = 66;
  const CONNECT_TIMEOUT_MS = 5000;

  class VTSClient {
    constructor() {
      this.ws = null;
      this.connected = false;
      this.authenticated = false;
      this.status = "offline";
      this.lastError = "";
      this.lastMessage = "";
      this.attempts = 0;
      this._connectTimer = null;
      this._manualDisconnect = false;
      this._lastSent = 0;
      this._lastOpen = -1;
      this._lastForm = -1;
      this._requestSeq = 0;
      this._angleZMotion = window.PLAngleZMotion ? window.PLAngleZMotion.create() : null;
    }

    get token() { return localStorage.getItem(LS_TOKEN) || ""; }
    get url() {
      const saved = localStorage.getItem(LS_URL);
      return !saved || saved === LEGACY_DEFAULT_URL ? DEFAULT_URL : saved;
    }
    set url(value) { localStorage.setItem(LS_URL, value.trim()); }
    set token(value) {
      if (value) localStorage.setItem(LS_TOKEN, value.trim());
      else localStorage.removeItem(LS_TOKEN);
    }

    connect(url = this.url) {
      if (this._angleZMotion) this._angleZMotion.reset(performance.now());
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
      this._manualDisconnect = false;
      this.attempts += 1;
      this.lastError = "";
      this._emitStatus("connecting", "正在连接 VTube Studio API...");
      try { this.ws = new WebSocket(url); }
      catch (error) { this._fail("浏览器无法创建 WebSocket"); return; }

      this._connectTimer = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this._fail("连接超时，请确认 VTube Studio API 已开启且端口为 8001");
          try { this.ws.close(); } catch (e) { /* ignore */ }
        }
      }, CONNECT_TIMEOUT_MS);
      this.ws.onopen = () => { clearTimeout(this._connectTimer); this._authenticate(); };
      this.ws.onmessage = (event) => this._onMessage(event.data);
      this.ws.onerror = () => this._fail("无法访问 VTube Studio，请检查 API 开关和端口");
      this.ws.onclose = () => {
        clearTimeout(this._connectTimer);
        this.connected = false;
        this.authenticated = false;
        if (!this._manualDisconnect) this._emitStatus("offline", "VTube Studio 连接已断开");
      };
    }

    disconnect() {
      if (this._angleZMotion) this._angleZMotion.reset(performance.now());
      this._manualDisconnect = true;
      if (this._connectTimer) clearTimeout(this._connectTimer);
      if (this.ws) { try { this.ws.close(); } catch (e) { /* ignore */ } }
      this.ws = null;
      this.connected = false;
      this.authenticated = false;
      this._emitStatus("offline", "已断开 VTube Studio");
    }

    reconnect() { this.disconnect(); this._manualDisconnect = false; this.connect(); }
    clearToken() { this.token = ""; this._emitStatus("offline", "授权已清除，请重新连接并接受授权"); }
    setUrl(value) {
      const url = String(value || "").trim();
      if (!/^wss?:\/\/[^\s]+$/i.test(url)) throw new Error("地址必须以 ws:// 或 wss:// 开头");
      this.url = url;
      return url;
    }

    _request(messageType, data) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      this._requestSeq += 1;
      this.ws.send(JSON.stringify({ apiName: "VTubeStudioPublicAPI", apiVersion: "1.0", requestID: "pl-" + this._requestSeq, messageType, data }));
    }

    _authenticate() {
      if (this.token) {
        this._request("AuthenticationRequest", { pluginName: "YUMENO", pluginDeveloper: "YUMENO", authenticationToken: this.token });
        this._emitStatus("auth", "正在验证 VTube Studio 授权...");
      } else {
        this._request("AuthenticationTokenRequest", { pluginName: "YUMENO", pluginDeveloper: "YUMENO" });
        this._emitStatus("auth", "请在 VTube Studio 中允许 YUMENO 插件");
      }
    }

    _onMessage(raw) {
      let message;
      try { message = JSON.parse(raw); } catch (e) { return; }
      if (message.messageType === "AuthenticationTokenResponse") {
        const token = message.data && message.data.authenticationToken;
        if (!token) { this._fail("VTube Studio 未返回授权令牌"); return; }
        this.token = token;
        this._request("AuthenticationRequest", { pluginName: "YUMENO", pluginDeveloper: "YUMENO", authenticationToken: token });
        this._emitStatus("auth", "已获得授权，正在验证...");
        return;
      }
      if (message.messageType === "APIError") {
        this._fail("VTube Studio API 错误：" + ((message.data && message.data.message) || "未知错误"));
        return;
      }
      if (message.messageType !== "AuthenticationResponse") return;
      const data = message.data || {};
      this.connected = Boolean(data.authenticated);
      this.authenticated = this.connected;
      if (!this.token && data.authenticationToken) this.token = data.authenticationToken;
      if (this.connected) this._emitStatus("ok", "已连接，YUMENO 正在自主驱动角色");
      else this._fail("授权失败：" + (data.reason || "请在 VTube Studio 中接受授权"));
    }

    setMouth(open, form, agentState = "idle") {
      if (!this.connected) return;
      const now = performance.now();
      if (now - this._lastSent < SEND_INTERVAL_MS) return;
      const roundedOpen = Math.round(open * 100) / 100;
      const roundedForm = Math.round(form * 100) / 100;
      this._lastOpen = roundedOpen; this._lastForm = roundedForm; this._lastSent = now;
      const activity = agentState === "thinking" ? 1.25 : agentState === "talking" ? 0.72 : 1;
      const seconds = now / 1000;
      const blinkPhase = (seconds % 4.2) / 4.2;
      const blink = blinkPhase > 0.82 && blinkPhase < 0.9
        ? Math.max(0, Math.abs(blinkPhase - 0.86) / 0.04)
        : 1;
      const faceX = Math.sin(seconds * 0.72) * 12 * activity;
      const faceY = Math.sin(seconds * 0.43 + 0.8) * 3.5 * activity;
      const faceZ = this._angleZMotion
        ? this._angleZMotion.sample(now, -30, 30)
        : Math.sin(seconds * 0.56 + 1.7) * 4.5;
      const bodyX = -faceX * 0.38;
      const bodyY = Math.sin(seconds * 0.34) * 1.8 * activity;
      const facePositionX = bodyX / 30;
      const facePositionY = bodyY / 30;
      this._request("InjectParameterDataRequest", {
        mode: "set",
        faceFound: true,
        parameterValues: [
          { id: "MouthOpen", value: roundedOpen },
          { id: "MouthSmile", value: (roundedForm + 1) / 2 },
          { id: "EyeOpenLeft", value: blink },
          { id: "EyeOpenRight", value: blink },
          { id: "FaceAngleX", value: faceX },
          { id: "FaceAngleY", value: faceY },
          { id: "FaceAngleZ", value: faceZ },
          { id: "FacePositionX", value: facePositionX },
          { id: "FacePositionY", value: facePositionY },
        ],
      });
    }

    _fail(message) {
      this.connected = false; this.authenticated = false; this._emitStatus("error", message);
    }

    _emitStatus(level, message) {
      this.status = level; this.lastMessage = message || "";
      if (level === "error") this.lastError = message || "";
      document.dispatchEvent(new CustomEvent("yumeno:live2d", { detail: { type: "vts", level, message } }));
    }
  }

  const client = new VTSClient();
  const disconnectOnClose = () => client.disconnect();
  window.addEventListener("pagehide", disconnectOnClose);
  window.addEventListener("beforeunload", disconnectOnClose);
  return client;
})();
