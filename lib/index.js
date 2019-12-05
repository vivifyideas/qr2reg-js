import swal from 'sweetalert';
import regzenButtonIcon from './images/regzen-button-icon.png';
import regzenAlertTitle from './images/regzen-alert-title.png';

function isMobile() {
  return window.innerWidth < 700;
}

export default class RegzenClient {
  constructor({ applicationId }) {
    this._applicationId = applicationId;
    this._onGrantedCallbacks = [];
    this._onDeniedCallbacks = [];
    this._onTimedOutCallbacks = [];
    this._onErrorCallbacks = [];
    this._popupWindow = null;

    this._poll = this._poll.bind(this);
    this._onPoll = this._onPoll.bind(this);
    this._receiveMessage = this._receiveMessage.bind(this);

    const urlParams = new URLSearchParams(window.location.search);
    const authorizationAttemptId = urlParams.get('attempt');

    if (urlParams.get('from') === 'mobile' && authorizationAttemptId) {
      this._request = new XMLHttpRequest();
      this._request.onload = this._onPoll;
      this._attempt = authorizationAttemptId;

      this._poll();
    }

    window.addEventListener('message', this._receiveMessage, false);
    window.onload = () => {
      this._injectFontsAndStyles();
      this._createSignInButton();
    };
  }

  signIn() {
    if (this._popupWindow !== null) {
      return;
    }

    this._popupWindow = window.open(
      `${RegzenClient._API_BASE_URL}/api/oauth?application_id=${this._applicationId}`,
      '_blank',
      `location=yes,left=0,top=0,height=${screen.height},width=${screen.width},status=yes`
    );

    this._isPopupWindowClosedPoll = setInterval(() => {
      if (this._popupWindow.closed) {
        this._popupWindow = null;
        clearInterval(this._isPopupWindowClosedPoll);
      }
    }, 300);
  }

  showProtectedAlert() {
    swal({
      title: ' ',
      text: isMobile()
        ? `This account is protected.
        Continue with Regzen to sign in.`
        : 'This account is protected by Regzen.',
      buttons: {
        cancel: {
          text: 'Dismiss',
          value: null,
          visible: true,
          className: '',
          closeModal: true,
        },
        confirm: {
          text: isMobile() ? 'Open Regzen' : 'Sign in with Regzen',
          value: true,
          visible: true,
          className: '',
          closeModal: true,
        },
      },
    }).then(value => {
      if (value) {
        this.signIn();
      }
    });

    const alertTitle = window.document.getElementsByClassName('swal-title')[0];

    const img = window.document.createElement('img');
    img.src = regzenAlertTitle;
    img.className = 'regzen-alert-title-image';

    alertTitle.appendChild(img);
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

  _poll() {
    if (!this._request) {
      return;
    }

    this._statusPoll = setInterval(() => {
      this._request.open(
        'get',
        `${RegzenClient._API_BASE_URL}/api/oauth/status?attempt=${this._attempt}`
      );
      this._request.send();
    }, 2000);
  }

  _onPoll() {
    if (this._request.status !== 200) {
      clearInterval(this._statusPoll);
      return;
    }

    const jsonResponse = JSON.parse(this._request.response);

    clearInterval(this._statusPoll);

    this._onGrantedCallbacks.forEach(callback =>
      callback(jsonResponse.data.authorization_code)
    );
  }

  _receiveMessage(message) {
    if (message.origin !== RegzenClient._API_BASE_URL) {
      return;
    }

    this._popupWindow = null;
    clearInterval(this._isPopupWindowClosedPoll);

    switch (message.data.type) {
      case RegzenClient._MESSAGE_TYPE.GRANTED:
        this._onGrantedCallbacks.forEach(callback =>
          callback(message.data.authorization_code)
        );
        break;

      case RegzenClient._MESSAGE_TYPE.DENIED:
        this._onDeniedCallbacks.forEach(callback => callback());
        break;

      case RegzenClient._MESSAGE_TYPE.TIMED_OUT:
        this._onTimedOutCallbacks.forEach(callback => callback());
        break;

      case RegzenClient._MESSAGE_TYPE.ERROR:
        this._onErrorCallbacks.forEach(callback =>
          callback(message.data.error)
        );
        break;

      default:
        break;
    }
  }

  _injectFontsAndStyles() {
    const font = window.document.createElement('link');
    font.href =
      'https://fonts.googleapis.com/css?family=Ubuntu:400,500&display=swap';
    font.rel = 'stylesheet';

    const styles = window.document.createElement('link');
    styles.href = 'https://unpkg.com/qr2reg-js/dist/index.css';
    styles.type = 'text/css';
    styles.rel = 'stylesheet';

    window.document.getElementsByTagName('head')[0].appendChild(font);
    window.document.getElementsByTagName('head')[0].appendChild(styles);
  }

  _createSignInButton() {
    const signInButton = window.document.getElementsByClassName(
      'regzen-sign-in'
    )[0];

    if (signInButton) {
      const img = document.createElement('img');
      img.src = regzenButtonIcon;
      img.className = 'regzen-sign-in__image';

      const div = document.createElement('div');
      div.className = 'regzen-sign-in__text-wrap';
      div.appendChild(document.createTextNode('Regzen'));

      signInButton.appendChild(img);
      signInButton.appendChild(div);
    }
  }
}

RegzenClient._API_BASE_URL = 'https://stage.qr2reg-api.vivifyideas.com';
RegzenClient._MESSAGE_TYPE = {
  DENIED: 'type:denied',
  GRANTED: 'type:granted',
  TIMED_OUT: 'type:timed_out',
  ERROR: 'type:error',
};
