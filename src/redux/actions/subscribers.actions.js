import * as ActionTypes from '../constants/constants'
import callApi from '../../utility/api.caller.service'

export function updateSubscribersInfo (data) {
  return {
    type: ActionTypes.UPDATE_SUBSCRIBERS_INFO,
    data
  }
}

export function updateSubscribers (payload, data) {
  if (data.filter_criteria.search_value === '') {
    if (data.first_page === 'first') {
      return {
        type: ActionTypes.FETCH_SUBSCRIBERS_OVERRIDE,
        data: payload.subscribers,
        count: payload.count
      }
    } else {
      return {
        type: ActionTypes.FETCH_SUBSCRIBERS,
        data: payload.subscribers,
        count: payload.count
      }
    }
  } else {
    if (data.first_page === 'first') {
      return {
        type: ActionTypes.FETCH_SUBSCRIBERS_SEARCH_OVERRIDE,
        data: payload.subscribers,
        count: payload.count
      }
    } else {
      return {
        type: ActionTypes.FETCH_SUBSCRIBERS_SEARCH,
        data: payload.subscribers,
        count: payload.count
      }
    }
  }
}

export function fetchSubscribers (data, callback) {
  return (dispatch) => {
    callApi(dispatch, 'subscribers/getAll', 'post', data).then(res => {
      if (res.status === 'success') {
        callback()
        dispatch(updateSubscribers(res.payload, data))
      }
    })
  }
}

export function updateSubscriberPicture (subscriberId, profilePic) {
  return {
    type: ActionTypes.UPDATE_SUBSCRIBER_PICTURE,
    subscriberId,
    profilePic
  }
}

export function updatePicture (subscriberData, callback) {
  return (dispatch) => {
    callApi(dispatch, 'subscribers/updatePicture', 'post', subscriberData).then(res => {
      if (res.status === 'success') {
        if (callback) {
          callback(res.payload)
        }
        dispatch(updateSubscriberPicture(subscriberData.subscriber._id, res.payload))
      } else {
        if (subscriberData.subscriber.gender === 'female') {
          if (callback) {
            callback('https://i.pinimg.com/236x/50/28/b5/5028b59b7c35b9ea1d12496c0cfe9e4d.jpg')
          }
          dispatch(updateSubscriberPicture(subscriberData.subscriber._id, 'https://i.pinimg.com/236x/50/28/b5/5028b59b7c35b9ea1d12496c0cfe9e4d.jpg'))
        } else {
          if (callback) {
            callback('https://www.mastermindpromotion.com/wp-content/uploads/2015/02/facebook-default-no-profile-pic-300x300.jpg')
          }
          dispatch(updateSubscriberPicture(subscriberData.subscriber._id, 'https://www.mastermindpromotion.com/wp-content/uploads/2015/02/facebook-default-no-profile-pic-300x300.jpg'))
        }
      }
    })
  }
}
