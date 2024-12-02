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
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
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

