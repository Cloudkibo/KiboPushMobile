import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchConnectedPages } from '../../redux/actions/pages.actions'
import { StyleSheet, Dimensions, FlatList, Clipboard, ActivityIndicator, Platform } from 'react-native'
import { Button, Block, Text, theme, Input } from 'galio-framework'
import { Select } from '../../components/'

const { width } = Dimensions.get('screen')

let Toast = null
if (Platform.OS === 'ios') {
  Toast = require('react-native-tiny-toast')
} else {
  Toast = require('react-native-simple-toast')
}

class InviteSubscribers extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      pagesFetched: false,
      listData: [{id: '0'}],
      selectedPage: '',
      showToast: false,
    }
    this.renderList = this.renderList.bind(this)
    this.getPageOptions = this.getPageOptions.bind(this)
    this.handlePageSelect = this.handlePageSelect.bind(this)
    this.getMessengerLink = this.getMessengerLink.bind(this)
    this.writeToClipboard = this.writeToClipboard.bind(this)
    this.handleFetchPagesResponse = this.handleFetchPagesResponse.bind(this)
  }


  handleFetchPagesResponse (connectedPages) {
    this.setState({pagesFetched: true, selectedPage: connectedPages[0]})
  }

  /* eslint-disable */
  UNSAFE_componentWillMount () {
  /* eslint-enable */
  }

  componentDidMount () {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.props.fetchConnectedPages(this.handleFetchPagesResponse)
    })
  }
  componentWillUnmount () {
    this._unsubscribe()
  }

  handlePageSelect (value, index) {
    let selectedPage = this.props.connectedPages[index]
    this.setState({selectedPage: selectedPage})
  }

  getPageOptions () {

    let options = []
    options = this.props.connectedPages.map(z => {
      return {label: z.pageName, value: z.pageName}
    })
    return options
  }

  getMessengerLink () {
    return this.state.selectedPage.pageUserName
      ? `https://m.me/${this.state.selectedPage.pageUserName}`
      : `https://m.me/${this.state.selectedPage.pageId}`
  }

  async writeToClipboard () {
    await Clipboard.setString(this.getMessengerLink())
    this.setState({showToast: true})
    Toast.default.show('Link Copied Successfully!')
  }

  renderList () {
    return (
      <Block style={Platform.OS === 'ios' ? {paddingVertical: 50, zIndex: 10} : {paddingVertical: 50}}>
        <Block flex row style={styles.options}>
          <Block flex={0.3} middle style={{marginTop: -15}}><Text size={16}> Select Page:</Text></Block>
          <Block flex={0.7} middle>
            <Select
              dropDownStyle={{width: width * 0.5}}
              style={{width: width * 0.5}}
              value={this.state.selectedPage.pageName}
              options={this.getPageOptions()}
              onSelect={(value, index) => this.handlePageSelect(value, index)}
            />
          </Block>
        </Block>
      </Block>
    )
  }

  render () {
    if (!this.state.pagesFetched ||
      (this.state.pagesFetched && this.props.pages && this.props.pages.length > 0 && this.state.pageSelected === '')) {
      return <ActivityIndicator size='large' style={{flex: 0.8}} />
    } else if (this.props.connectedPages && this.props.connectedPages.length === 0) {
      return <Block flex center style={{marginVertical: 20}}><Text>You do not have any connected Pages</Text></Block>
    } else {
      return (
        <Block flex center style={styles.block}>
          <Block style={{...styles.subBlock, zIndex: 10}}>
            {this.renderList()}
            <Block style={{marginHorizontal: 16}}>
              <Text h6>This is the link to your Facebook Page on Messenger. Copy this link and share it with people to invite them to become subscribers of your page.</Text>
              <Input
                color='black'
                style={{marginTop: 10}}
                editable={false}
                value={this.getMessengerLink()}
              />
            </Block>
            <Block middle style={{marginVertical: 30}}>
              <Button size='small' onPress={this.writeToClipboard}>Copy To Clipboard</Button>
            </Block>
          </Block>
        </Block>
      )
    }
  }
}

function mapStateToProps (state) {
  return {
    connectedPages: (state.pagesInfo.connectedPages)
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    fetchConnectedPages
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteSubscribers)

const styles = StyleSheet.create({
  block: {
    width: width,
    zIndex: 10
  },
  subBlock: {
    width: width,
    borderWidth: 0,
    // marginVertical: theme.SIZES.BASE * 1.5,
    marginHorizontal: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: theme.SIZES.BASE / 4,
    shadowOpacity: 0.1
  },
  options: {
    padding: theme.SIZES.BASE / 2,
    flexWrap: "wrap",
  }
})
