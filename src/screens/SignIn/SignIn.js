import React, {useEffect} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, Dimensions, Platform, Image, TouchableOpacity, Text, AsyncStorage } from 'react-native'
import { Block, Button, Input, theme } from 'galio-framework'
import { useFocusEffect } from '@react-navigation/native';
import { withNavigation } from "react-navigation";

import { LinearGradient } from 'expo-linear-gradient'
import { materialTheme } from '../../constants/'
import { HeaderHeight } from '../../constants/utils'

import { signIn } from '../../redux/actions/signIn.actions'
import { logOut } from '../../redux/actions/logOut.actions'

const { width } = Dimensions.get('window')

class SignIn extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      email: '',
      password: '',
      active: {
        email: false,
        password: false,
        errorMessage: ''
      }
    }
    this.handleChange = this.handleChange.bind(this)
    this.login = this.login.bind(this)
    this.handleResponse = this.handleResponse.bind(this)
  }

  componentDidMount () {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.props.logOut()
    })
  }
  componentWillUnmount () {
    // Remove the event listener
    // this.props.focusListener.remove();
    // this.list.forEach( item => item.remove() )
    this._unsubscribe()
  }

  handleChange (name, value) {
    this.setState({ [name]: value })
    this.setState({ errorMessage: null })
  }

  toggleActive (name) {
    const { active } = this.state
    active[name] = !active[name]

    this.setState({ active })
  }

  login () {
    if (this.state.email === '') {
      this.setState({errorMessage: 'Email is Required'})
    } else if (this.state.password === '') {
      this.setState({errorMessage: 'Password is required'})
    } else {
      this.props.signIn({email: this.state.email, password: this.state.password}, this.handleResponse)
    }
  }

  async handleResponse (res) {
    if (res.status === 'success') {
      await AsyncStorage.setItem('token', res.token)
      this.props.navigation.navigate('App Loading')
    } else if (res.status === 'failed') {
      this.setState({errorMessage: res.description})
    }
  }

  render () {
    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1.1 }}
        locations={[0.2, 1]}
        colors={['#fff', '#fff']}
        style={[styles.signin, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
        <Block flex middle>
          <Block flex={0.2} middle>
            <Image source={require('../../../assets/images/logo.png')} style={styles.image} />
          </Block>
          <Block flex={0.5} middle>
            <Block center>
              <Input
                borderless
                color='black'
                placeholder='Email'
                type='email-address'
                autoCapitalize='none'
                bgColor='transparent'
                onBlur={() => this.toggleActive('email')}
                onFocus={() => this.toggleActive('email')}
                placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                value={this.state.email}
                onChangeText={text => this.handleChange('email', text)}
                style={styles.input}
              />
              <Input
                password
                viewPass
                borderless
                color='black'
                autoCapitalize='none'
                iconColor={materialTheme.COLORS.PLACEHOLDER}
                placeholder='Password'
                bgColor='transparent'
                onBlur={() => this.toggleActive('password')}
                onFocus={() => this.toggleActive('password')}
                placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                value={this.state.password}
                onChangeText={text => this.handleChange('password', text)}
                style={styles.input}
              />
              {this.state.errorMessage &&
                <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
              }
            </Block>
            <Block flex top style={{ marginTop: 50 }}>
              <TouchableOpacity disabled={this.state.password === '' || this.state.email === ''}>
                <Button
                  shadowless
                  style={{ height: 48 }}
                  onPress={this.login}
                >
                    SIGN IN
                </Button>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
      </LinearGradient>
    )
  }
}
function mapStateToProps (state) {
  return {
  }
}
function mapDispatchToProps (dispatch) {
  return bindActionCreators(
    {signIn, logOut},
    dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(SignIn)

const styles = StyleSheet.create({
  signin: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0
  },
  input: {
    marginTop: 20,
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER
  },
  image: {
    height: 70,
    width: 330
  },
  errorMessage: {
    color: 'red',
    justifyContent: 'flex-start',
    marginTop: 20
  }
})