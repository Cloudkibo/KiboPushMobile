import React from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, Platform } from 'react-native'
import { Block, Text } from 'galio-framework'
import Icon from '../../../components/Icon'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as Permissions from 'expo-permissions'

let Toast = null
if (Platform.OS === 'ios') {
  Toast = require('react-native-tiny-toast')
} else {
  Toast = require('react-native-simple-toast')
}

class File extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {}
    this.downloadFile = this.downloadFile.bind(this)
  }

  async downloadFile () {
    FileSystem.downloadAsync(this.props.file.fileurl.url, FileSystem.documentDirectory + this.props.file.fileName)
      .then(({ uri }) => {
        this.saveFile(uri)
      })
      .catch(error => {
        console.log(error)
      })
  }

  async saveFile (fileUri) {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    if (status === 'granted') {
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      let response = await MediaLibrary.createAlbumAsync('Download', asset, false)
      if (response) {
        Toast.default.show('File Saved Successfully!')
      }
    }
  }

  render () {
    return (
      <TouchableOpacity onPress={this.downloadFile}>
        <Block row>
          <Icon
            color={this.props.textColor}
            size={16}
            name='file-text'
            family='Feather'
            style={{marginRight: 5}}
          />
          <Text color={this.props.textColor}
            style={{textDecorationLine: 'underline'}}>
            {this.props.file.fileName}
          </Text>
        </Block>
      </TouchableOpacity>
    )
  }
}

File.propTypes = {
  'file': PropTypes.object.isRequired,
  'textColor': PropTypes.string
}

export default File
