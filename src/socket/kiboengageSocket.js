/**
 * Created by sojharo on 20/08/2017.
 */
import io from 'socket.io-client'
import { setSocketStatus } from '../redux/actions/socket.actions'
import { socketUpdate, updateSessions } from './../redux/actions/liveChat.actions'
import { handleSubscribers } from './subscribers'
import { handleFBPageEvent } from './pages'
import { handleWhatsAppSubscribers } from './whatsAppSubscribers'
import { handleSocketEvent, handleSocketEventWhatsapp, handleSocketEventSubscribers, handleSocketEventSubscribersWhatsApp } from '../redux/actions/socket.actions'
const whatsAppActions = require('./../redux/actions/whatsAppChat.actions')
const socket = io('https://kiboengage.cloudkibo.com')
let store

var joined = false
var myId = ''

var callbacks = {
  new_chat: false
}

export function registerAction (callback) {
  callbacks[callback.event] = callback.action
}

export function initiateKiboEngageSocket (storeObj) {
  store = storeObj
  socket.connect()
}

socket.on('connect', () => {
  console.log('connectionEstablished')
  if (myId !== '') {
    joinRoomKiboEngage(myId)
  }
  store.dispatch(setSocketStatus(true))
})

socket.on('disconnect', () => {
  console.log('disconnect')
  joined = false
  store.dispatch(setSocketStatus(false))
})

socket.on('connect_error', () => {
  console.log('connect_error')
  joined = false
  store.dispatch(setSocketStatus(false))
})

socket.on('connect_timeout', () => {
  console.log('connect_timeout')
  joined = false
  store.dispatch(setSocketStatus(false))
})

socket.on('new_chat', (data) => {
  store.dispatch(socketUpdate(data))
})

socket.on('message', (data) => {
  console.log('socket KiboEngage called', data.action)
  if ([
    'Messenger_new_subscriber',
    'Messenger_subscribe_subscriber',
    'Messenger_unsubscribe_subscriber'].includes(data.action)) {
    handleSubscribers(store, data)
  }
  if (['page_connect', 'page_disconnect'].includes(data.action)) {
    handleFBPageEvent(store, data)
  }
  if ([
    'Whatsapp_new_subscriber',
    'Whatsapp_subscribe_subscriber',
    'Whatsapp_unsubscribe_subscriber',
    'Whatsapp_subscriberName_update'].includes(data.action)) {
    handleWhatsAppSubscribers(store, data)
  }
  // if (['new_chat', 'agent_replied', 'session_pending_response', 'unsubscribe', 'session_status'].includes(data.action)) {
  //   if (data.action === 'new_chat') data.showNotification = true
  //   store.dispatch(handleSocketEvent(data))
  // } else if (data.action === 'session_assign') {
  //   store.dispatch(updateSessions(data.payload.data))
  // } else if (data.action === 'new_session_created_whatsapp') {
  //   store.dispatch(whatsAppActions.updateWhatspSessions(data.payload))
  // }
  // if (['new_chat_whatsapp', 'agent_replied_whatsapp', 'session_pending_response_whatsapp', 'unsubscribe_whatsapp', 'session_status_whatsapp', 'new_session_created_whatsapp', 'message_delivered_whatsApp', 'message_seen_whatsApp'].includes(data.action)) {
  //   if (data.action === 'new_chat_whatsapp') data.showNotification = true
  //   store.dispatch(handleSocketEventWhatsapp(data))
  // }
  // if (['new_subscriber'].includes(data.action)) {
  //   store.dispatch(handleSocketEventSubscribers(data))
  // }
  // if (['new_subscriber_whatsapp'].includes(data.action)) {
  //   store.dispatch(handleSocketEventSubscribersWhatsApp(data))
  // }
  if (callbacks[data.action]) {
    console.log('callback')
    callbacks[data.action](data.payload)
  }
})

export function log (tag, data) {
  socket.emit('logClient', {
    tag,
    data
  })
}

export function joinRoomKiboEngage (data) {
  console.log('Trying to join room socket on KiboEngage', data)
  myId = data
  if (joined) {
    return
  }
  socket.emit('message', {
    action: 'join_room',
    room_id: data
  })
  joined = true
}
