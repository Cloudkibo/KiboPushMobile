import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, Dimensions } from 'react-native'
import { Block } from 'galio-framework'
import * as Notifications from 'expo-notifications'

import CHAT from '../../components/LiveChat/Chat/index'
import {
  fetchUserChats,
  fetchTeamAgents,
  changeStatus,
  assignToTeam,
  assignToAgent,
  sendNotifications,
  sendChatMessage,
  uploadAttachment,
  sendAttachment,
  uploadRecording,
  markRead,
  updateLiveChatInfo,
  getSMPStatus,
  updateSessionProfilePicture,
  deletefile,
  setUserChat
} from '../../redux/actions/liveChat.actions'
import {getZoomIntegrations, createZoomMeeting, loadcannedResponses} from '../../redux/actions/settings.action'
import { clearSocketData } from '../../redux/actions/socket.actions'
import { loadTeamsList } from '../../redux/actions/teams.actions'
import { loadMembersList } from '../../redux/actions/members.actions'
const { width } = Dimensions.get('screen')

class LiveChat extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      fetchingChat: false,
      loadingChat: !this.props.allChatMessages[props.route.params.activeSession._id],
      teamAgents: [],
      userChat: [],
      smpStatus: [],
      height: 0,
      activeSession: props.route.params.activeSession,
      sessions: props.route.params.sessions,
      tabValue: props.route.params.tabValue,
      cannedResponses: []
    }
    this.isSMPApproved = this.isSMPApproved.bind(this)
    this.setMessageData = this.setMessageData.bind(this)
    this.performAction = this.performAction.bind(this)
    this.handleAgents = this.handleAgents.bind(this)
    this.fetchTeamAgents = this.fetchTeamAgents.bind(this)
    this.updateState = this.updateState.bind(this)
    this.handleSMPStatus = this.handleSMPStatus.bind(this)
    this.getPushNotificationsAsync = this.getPushNotificationsAsync.bind(this)
    // if( props.route.params && !props.route.params.sessions) {

    // }
    this.props.loadcannedResponses()
    if (this.props.allChatMessages[props.route.params.activeSession._id]) {
      this.props.setUserChat(props.route.params.activeSession._id, props.route.params.activeSession.messagesCount)
    } else {
      this.props.fetchUserChats(props.route.params.activeSession._id, { page: 'first', number: 25 }, props.route.params.activeSession.messagesCount)
    }
    // this.props.fetchUserChats(props.route.params.activeSession._id, { page: 'first', number: 25 }, props.route.params.activeSession.messagesCount)
    props.getSMPStatus(this.handleSMPStatus)
    props.getZoomIntegrations()
    // if (props.route.params.activeSession.unreadCount && props.route.params.activeSession.unreadCount > 0) {
    //   this.props.markRead(props.route.params.activeSession._id)
    // }
    if (this.props.user.currentPlan.unique_ID === 'plan_C' || this.props.user.currentPlan.unique_ID === 'plan_D') {
      props.loadMembersList()
      props.loadTeamsList({pageId: props.route.params.activeSession.pageId._id})
    }
  }

  updateState (state, callback) {
    const allChatMessages = this.props.allChatMessages
    allChatMessages[this.state.activeSession._id] = state.userChat
    if (state.reducer) {
      const data = {
        userChat: state.userChat,
        allChatMessages,
        openSessions: this.state.tabValue === 'open' ? state.sessions : this.props.openSessions,
        closeSessions: this.state.tabValue === 'close' ? state.sessions : this.props.closeSessions
      }
      this.props.updateLiveChatInfo(data)
    } else {
      this.setState(state, () => {
        if (callback) callback()
      })
    }
  }

  handleSMPStatus (res) {
    if (res.status === 'success') {
      this.setState({smpStatus: res.payload})
    }
  }

  async getPushNotificationsAsync (sessionId) {
    let notifications = await Notifications.getPresentedNotificationsAsync()
    // // let data = JSON.parse(notification[0])
    for (let notification of notifications) {
      if (notification.request.content.data.subscriber && (notification.request.content.data.subscriber._id === sessionId)) {
        let removeNotification = await Notifications.dismissNotificationAsync(notification.request.identifier)
      }
    }
    // console.log('notification[0].identifier', notification[0].request.identifier)
    // let removeNotification = await Notifications.dismissNotificationAsync(notification[0].request.identifier)
    // // console.log('notification in Live chat', data)
    // console.log('remove_notidication', removeNotification)
  }

  /* eslint-disable */
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.openSessions && !this.state.sessions) {
      this.setState({sessions:nextProps.openSessions})
    }
  /* eslint-enable */
    let state = {}
    if (nextProps.cannedResponses !== this.props.cannedResponses) {
      this.setState({cannedResponses: nextProps.cannedResponses})
    }
    if (nextProps.userChat) {
      if (nextProps.userChat.length > 0) {
        this.getPushNotificationsAsync(this.state.activeSession._id)
        state.userChat = nextProps.userChat
        state.loadingChat = false
      } else if (nextProps.userChat.length === 0) {
        state.loadingChat = false
      }
    }

    if (nextProps.backgroundDataFetch) {
      this.props.updateLiveChatInfo({backgroundDataFetch: false})
      this.setState({loadingChat: true})
      this.props.fetchUserChats(this.props.route.params.activeSession._id, { page: 'first', number: 25 }, this.props.route.params.activeSession.messagesCount)
    }

    this.setState({
      ...state
    })

    // if (nextProps.socketData) {
    //   handleSocketEvent(
    //     nextProps.socketData,
    //     this.state,
    //     this.props,
    //     this.props.updateLiveChatInfo,
    //     this.props.user,
    //     this.props.clearSocketData
    //   )
    // }
  }

  isSMPApproved () {
    const page = this.state.smpStatus.find((item) => item.pageId === this.state.activeSession.pageId._id)
    if (page && page.smpStatus === 'approved') {
      return true
    } else {
      return false
    }
  }

  performAction (errorMsg, session) {
    let isAllowed = true
    if (session.is_assigned) {
      if (session.assigned_to.type === 'agent' && session.assigned_to.id !== this.props.user._id) {
        isAllowed = false
        errorMsg = `Only assigned agent can ${errorMsg}`
      } else if (session.assigned_to.type === 'team') {
        const agentIds = this.props.teamAgents && this.props.teamAgents.map((agent) => agent.agentId._id)
        if (!agentIds.includes(this.props.user._id)) {
          isAllowed = false
          errorMsg = `Only agents who are part of assigned team can ${errorMsg}`
        }
      }
    }
    errorMsg = `You can not perform this action. ${errorMsg}`
    return {isAllowed, errorMsg}
  }

  fetchTeamAgents (id) {
    this.props.fetchTeamAgents(id, this.handleAgents)
  }

  handleAgents (teamAgents) {
    let agentIds = []
    for (let i = 0; i < teamAgents.length; i++) {
      if (teamAgents[i].agentId !== this.props.user._id) {
        agentIds.push(teamAgents[i].agentId)
      }
    }
    // if (agentIds.length > 0) {
    //   let notificationsData = {
    //     message: `Session of subscriber ${this.state.activeSession.firstName + ' ' + this.state.activeSession.lastName} has been assigned to your team.`,
    //     category: { type: 'chat_session', id: this.state.activeSession._id },
    //     agentIds: agentIds,
    //     companyId: this.state.activeSession.companyId
    //   }
    //   this.props.sendNotifications(notificationsData)
    // }
  }

  setMessageData (session, payload) {
    const data = {
      _id: new Date().getTime(),
      sender_id: session.pageId._id,
      recipient_id: session._id,
      sender_fb_id: session.pageId.pageId,
      recipient_fb_id: session.senderId,
      subscriber_id: session._id,
      company_id: session.companyId,
      payload: payload,
      url_meta: this.state.urlmeta,
      datetime: new Date().toString(),
      status: 'unseen',
      replied_by: {
        type: 'agent',
        id: this.props.user._id,
        name: this.props.user.name
      }
    }
    return data
  }

  render () {
    return (
      <Block flex style={styles.block}>
        <Block shadow flex>
          <CHAT
            cannedResponses={this.state.cannedResponses}
            userChat={this.state.userChat}
            chatCount={this.props.chatCount}
            sessions={this.state.sessions}
            activeSession={this.state.activeSession}
            changeStatus={this.changeStatus}
            updateState={this.updateState}
            getChatPreview={this.getChatPreview}
            handlePendingResponse={this.handlePendingResponse}
            showSearch={this.showSearch}
            performAction={this.performAction}
            alertMsg={this.alertMsg}
            user={this.props.user}
            sendChatMessage={this.props.sendChatMessage}
            uploadAttachment={this.props.uploadAttachment}
            sendAttachment={this.props.sendAttachment}
            uploadRecording={this.props.uploadRecording}
            loadingChat={this.state.loadingChat}
            fetchUserChats={this.props.fetchUserChats}
            markRead={this.props.markRead}
            deletefile={this.props.deletefile}
            fetchUrlMeta={this.props.urlMetaData}
            isSMPApproved={this.isSMPApproved()}
            showUploadAttachment
            showRecordAudio
            showSticker
            showEmoji
            showGif
            showThumbsUp
            setMessageData={this.setMessageData}
            filesAccepted={'image/*, audio/*, video/*, application/*, text/*'}
            showZoom={(this.props.zoomIntegrations.length && this.props.zoomIntegrations.length === 0 ? (this.props.user.role === 'admin' || this.props.user.role === 'buyer') ? true : false : true)}
            zoomIntegrations={this.props.zoomIntegrations}
            createZoomMeeting={this.props.createZoomMeeting}
          />
        </Block>
      </Block>
    )
  }
}

function mapStateToProps (state) {
  return {
    userChat: (state.liveChat.userChat),
    chatCount: (state.liveChat.chatCount),
    allChatMessages: (state.liveChat.allChatMessages),
    backgroundDataFetch: (state.liveChat.backgroundDataFetch),
    pages: (state.pagesInfo.pages),
    user: (state.basicInfo.user),
    // members: (state.membersInfo.members),
    // teams: (state.teamsInfo.teams),
    socketData: (state.socketInfo.socketData),
    openSessions: (state.liveChat.openSessions),
    openCount: (state.liveChat.openCount),
    closeCount: (state.liveChat.closeCount),
    closeSessions: (state.liveChat.closeSessions),
    cannedResponses: state.settingsInfo.cannedResponses,
    zoomIntegrations: (state.settingsInfo.zoomIntegrations),
    teamAgents: (state.teamsInfo.assignedTeamAgents)
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    // updatePicture,
    fetchTeamAgents,
    assignToTeam,
    changeStatus,
    loadTeamsList,
    sendNotifications,
    loadMembersList,
    assignToAgent,
    sendChatMessage,
    uploadAttachment,
    sendAttachment,
    uploadRecording,
    fetchUserChats,
    markRead,
    clearSocketData,
    updateLiveChatInfo,
    // urlMetaData,
    getSMPStatus,
    updateSessionProfilePicture,
    deletefile,
    loadcannedResponses,
    getZoomIntegrations,
    createZoomMeeting,
    setUserChat
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveChat)
const styles = StyleSheet.create({
  block: {
    width: width
  }
})
