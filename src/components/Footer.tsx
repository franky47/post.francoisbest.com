import React from 'react'
import { Box, BoxProps, Text } from '@chakra-ui/react'
import { OutgoingLink } from '@47ng/chakra-next'

export interface FooterProps extends BoxProps {}

console.log(`NEXT_PUBLIC_GIT_SHA1: ${process.env.NEXT_PUBLIC_GIT_SHA1}`)

export const Footer: React.FC<FooterProps> = ({ ...props }) => {
  return (
    <Box as="footer" textAlign="center" {...props}>
      <Text color="gray.500" fontSize="sm">
        Made by{' '}
        <OutgoingLink href="https://francoisbest.com" textDecor="underline">
          François Best
        </OutgoingLink>{' '}
        - Source on{' '}
        <OutgoingLink
          href="https://github.com/franky47/post.francoisbest.com"
          textDecor="underline"
        >
          GitHub
        </OutgoingLink>{' '}
        <Text as="span" fontFamily="mono" fontSize="xs">
          ({(process.env.NEXT_PUBLIC_GIT_SHA1 ?? 'local').slice(0, 8)})
        </Text>
      </Text>
    </Box>
  )
}
