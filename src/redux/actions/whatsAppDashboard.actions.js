
import * as ActionTypes from '../constants/constants'
import callApi from '../../utility/api.caller.service'

export function updateDashboardInfo (data) {
  return {
    type: ActionTypes.UPDATE_DASHBOARD_INFO_WHATSAPP,
    data
  }
}

export function showCardBoxesData (data) {
  return {
    type: ActionTypes.SHOW_CARDBOXES_DATA,
    data
  }
}

export function clearWhatsappDashboardData () {
  return (dispatch) => {
    dispatch(showCardBoxesData(null))
  }
}

export function loadCardBoxesDataWhatsApp () {
  return (dispatch) => {
    callApi(dispatch, 'whatsAppDashboard')
      .then(res => {
        if (res.status === 'success') {
          dispatch(showCardBoxesData(res.payload))
        }
      })
  }
}
