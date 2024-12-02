import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white'
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '0',
      },
      variants: {
        outline: {
          border: '1px solid',
          borderColor: 'white',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    },
    Tabs: {
      variants: {
        unstyled: {
          tab: {
            color: 'white',
            _selected: {
              color: 'white',
              bg: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      }
    }
  }
})

export default theme

