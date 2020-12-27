import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import Head from 'next/head'
import React from 'react'

const theme = extendTheme({
  config: {
    useSystemColorMode: true,
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
