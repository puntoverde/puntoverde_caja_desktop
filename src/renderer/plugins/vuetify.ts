// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import type {ThemeDefinition} from 'vuetify'

const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#14bf98',
    secondary: '#113448',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
}

// primary: '#14bf98',//'#607D8B',//'#212121',
//         secondary: '#113448',//'#424242',
//         accent: '#BDBDBD',
//         error: '#424242',//'#FF5252',
//         info: '#2196F3',
//         success: '#4CAF50',
//         warning: '#FFC107'

export default createVuetify(
  {
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      }
    }
  }
)
