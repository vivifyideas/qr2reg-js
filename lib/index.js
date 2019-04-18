export default class QR2REGClient {
  constructor({ applicationId }) {
    this._applicationId = applicationId;
    this._onGrantedCallbacks = [];
    this._onDeniedCallbacks = [];
    this._onTimedOutCallbacks = [];
    this._onErrorCallbacks = [];
    this._popupWindow = null;

    this._receiveMessage = this._receiveMessage.bind(this);

    window.addEventListener('message', this._receiveMessage, false);
  }

  signIn() {
    if (this._popupWindow !== null) {
      return;
    }

    this._popupWindow = window.open(
      `${QR2REGClient._API_BASE_URL}/api/oauth?application_id=${
        this._applicationId
      }`,
      '_blank',
      'location=yes,left=0,top=0,height=375,width=375,status=yes'
    );

    this._isPopupWindowClosedPoll = setInterval(() => {
      if (this._popupWindow.closed) {
        this._popupWindow = null;
        clearInterval(this._isPopupWindowClosedPoll);
      }
    }, 300);
  }

  onGranted(onGrantedCallback) {
    this._onGrantedCallbacks.push(onGrantedCallback);
  }

  onDenied(onDeniedCallback) {
    this._onDeniedCallbacks.push(onDeniedCallback);
  }

  onTimedOut(onTimedOutCallback) {
    this._onTimedOutCallbacks.push(onTimedOutCallback);
  }

  onError(onErrorCallback) {
    this._onErrorCallbacks.push(onErrorCallback);
  }

  _receiveMessage(message) {
    if (message.origin !== QR2REGClient._API_BASE_URL) {
      return;
    }

    this._popupWindow = null;
    clearInterval(this._isPopupWindowClosedPoll);

    switch (message.data.type) {
      case QR2REGClient._MESSAGE_TYPE.GRANTED:
        this._onGrantedCallbacks.forEach(callback =>
          callback(message.data.authorization_code)
        );
        break;

      case QR2REGClient._MESSAGE_TYPE.DENIED:
        this._onDeniedCallbacks.forEach(callback => callback());
        break;

      case QR2REGClient._MESSAGE_TYPE.TIMED_OUT:
        this._onTimedOutCallbacks.forEach(callback => callback());
        break;

      case QR2REGClient._MESSAGE_TYPE.ERROR:
        this._onErrorCallbacks.forEach(callback =>
          callback(message.data.error)
        );
        break;

      default:
        break;
    }
  }
}

QR2REGClient._API_BASE_URL = 'https://stage.qr2reg-api.vivifyideas.com';
QR2REGClient._MESSAGE_TYPE = {
  DENIED: 'type:denied',
  GRANTED: 'type:granted',
  TIMED_OUT: 'type:timed_out',
  ERROR: 'type:error',
};
