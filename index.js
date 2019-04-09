function QR2REGClient({ applicationId }) {
  const API_BASE_URL = 'https://stage.qr2reg-api.vivifyideas.com'

  const TYPE = {
    DENIED: 'type:denied',
    GRANTED: 'type:granted',
    TIMED_OUT: 'type:timed_out',
    ERROR: 'type:error'
  }

  this.applicationId = applicationId
  this.onGrantedCallbacks = []
  this.onDeniedCallbacks = []
  this.onTimedOutCallbacks = []
  this.onErrorCallbacks = []

  this.signIn = () => {
    window.open(
      `${API_BASE_URL}/api/oauth?application_id=${this.applicationId}`,
      '_blank',
      'location=yes,left=0,top=0,height=375,width=375,status=yes'
    )
  }

  this.onGranted = (onGrantedCallback) => {
    this.onGrantedCallbacks.push(onGrantedCallback)
  }

  this.onDenied = (onDeniedCallback) => {
    this.onDeniedCallbacks.push(onDeniedCallback)
  }

  this.onTimedOut = (onTimedOutCallback) => {
    this.onTimedOutCallbacks.push(onTimedOutCallback)
  }

  this.onError = (onErrorCallback) => {
    this.onErrorCallbacks.push(onErrorCallback)
  }

  this.receiveMessage = (event) => {
    if (event.origin !== API_BASE_URL) {
      return
    }

    switch (event.data.type) {
      case TYPE.GRANTED:
        this.onGrantedCallbacks.forEach(callback => callback(event.data.authorization_code))
        break

      case TYPE.DENIED:
        this.onDeniedCallbacks.forEach(callback => callback())
        break

      case TYPE.TIMED_OUT:
        this.onTimedOutCallbacks.forEach(callback => callback())
        break

      case TYPE.ERROR:
        this.onErrorCallbacks.forEach(callback => callback(event.data.error))
        break

      default:
        break
    }
  }

  window.addEventListener('message', this.receiveMessage, false)
}
