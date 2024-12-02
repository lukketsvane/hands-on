// pages/_app.js

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

const theme = extendTheme({
  styles: {
    global: {
      // Remove all border radii for sharp corners
      '*': {
        borderRadius: '0 !important',
      },
    },
  },
  colors: {
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    mono: 'Menlo, monospace',
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
