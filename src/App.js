import React from 'react'
import { registerRootComponent, AppLoading } from 'expo'
import { Platform, StatusBar, Image } from 'react-native';
import { GalioProvider } from 'galio-framework'
import { NavigationContainer } from '@react-navigation/native'
import { navigationRef } from './rootNavigation'
import { Provider } from 'react-redux'
import { configureStore } from './redux/store/store'
import SubApp from './sub.app'
// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens'
import { initiateKibochatSocket } from './socket/kibochatSocket'
import { initiateKiboEngageSocket } from './socket/kiboengageSocket'
import { materialTheme, Images } from './constants/'
import * as Sentry from 'sentry-expo'
enableScreens()

import Screens from './navigation/Screens';

const assetImages = [
  Images.Profile,
  Images.Avatar,
  Images.Onboarding
];
// cache product images
// products.map(product => assetImages.push(product.image));

// cache categories images
// Object.keys(categories).map(key => {
//   categories[key].map(category => assetImages.push(category.image));
// });

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const store = configureStore()
initiateKibochatSocket(store)
initiateKiboEngageSocket(store)

Sentry.init({
  dsn: 'https://6c7958e0570f455381d6f17122fbd117@o132281.ingest.sentry.io/292307',
  enableInExpoDevelopment: false,
  release: 'KiboPushMobile@1.0.0',
  environment: 'Production',
  serverName: 'KiboPushMobile',
  debug: true,
  attachStacktrace: true
})
class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };
  render () {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      )
    } else {
      return (
        <Provider store={store}>
          <NavigationContainer ref={navigationRef}>
            <GalioProvider theme={materialTheme}>
              <SubApp />
            </GalioProvider>
          </NavigationContainer>
        </Provider>
      )
    }
  }
  _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

export default registerRootComponent(App)
