// Debe ser la PRIMERA importación de la app: react-native-gesture-handler
// instala su manejador de toques a nivel nativo al cargarse, y el drawer
// lateral (@react-navigation/drawer v7) no funciona si algo se importa antes.
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
