import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import '../styles/fonts.css' // We'll create this file to import the Geist fonts

const theme = extendTheme({
  fonts: {
    body: 'Geist, sans-serif',
    heading: 'Geist, sans-serif',
    mono: 'Geist Mono, monospace',
  },
  colors: {
    brand: {
      light: '#FFFFFF',
      dark: '#000000',
    },
  },
})

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp

