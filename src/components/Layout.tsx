import React from 'react'
import { Container, ContainerProps, Heading } from '@chakra-ui/react'
import { Nav } from './Nav'
import { Footer } from './Footer'
import Head from 'next/head'

export interface LayoutProps extends ContainerProps {
  title: string
}

export const Layout: React.FC<LayoutProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Container as="main" my={8} {...props}>
        <Nav mb={8} />
        <Heading mb={8} as="h1" lineHeight="1.25">
          {title}
        </Heading>
        {children}
        <Footer mt={8} />
      </Container>
    </>
  )
}
