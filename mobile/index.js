/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerExternalPushBackgroundHandler } from './src/services/externalPush.service';

registerExternalPushBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
