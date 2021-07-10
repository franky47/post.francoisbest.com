import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { darken, getColor, mode } from '@chakra-ui/theme-tools'
import { Dict } from '@chakra-ui/utils'
import Head from 'next/head'
import React from 'react'

import 'react-datepicker/dist/react-datepicker.css'
import 'src/components/date-picker/date-picker.css'

const theme = extendTheme({
  styles: {
    global: ({ colorMode }) => ({
      body: {
        position: 'static',
      },
      'html, body': {
        bg: colorMode === 'light' ? 'white' : 'gray.1000',
        color: colorMode === 'light' ? 'gray.800' : 'gray.300',
      },
    }),
  },
  colors: {
    gray: {
      1000: '#121721',
    },
  },
  components: {
    Alert: {
      variants: {
        'left-accent': (props: Dict) => {
          const { theme, colorScheme: c } = props
          const lightBg = getColor(theme, `${c}.100`, c)
          const darkBg = darken(`${c}.900`, 1)(theme)
          const bg = mode(lightBg, darkBg)(props)
          return {
            container: {
              bg,
            },
          }
        },
      },
    },
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
})

function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>Write</title>
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  )
}

export default MyApp
