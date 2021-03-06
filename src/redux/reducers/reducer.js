import { combineReducers } from 'redux'

import {dashboardInfo} from './dashboard.reducer'
import {basicInfo} from './basicInfo.reducer'
import {pagesInfo} from './pages.reducer'
import {subscribersInfo} from './subscribers.reducer'
import {liveChat} from './liveChat.reducer.js'
import {membersInfo} from './members.reducer.js'
import {teamsInfo} from './teams.reducer.js'
import {socketInfo} from './socket.reducer'
import {settingsInfo} from './settings.reducer'
import {smsWhatsAppDashboardInfo} from './smsWhatsAppDashboard.reducer'
import {whatsAppChatInfo} from './whatsAppChat.reducer'
import {whatsAppSubscribersInfo} from './whatsAppSubscribers.reducer'

const appReducer = combineReducers({
  dashboardInfo,
  basicInfo,
  pagesInfo,
  subscribersInfo,
  liveChat,
  membersInfo,
  teamsInfo,
  socketInfo,
  settingsInfo,
  smsWhatsAppDashboardInfo,
  whatsAppChatInfo,
  whatsAppSubscribersInfo
})

export default appReducer
