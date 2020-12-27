import React from 'react'
import { Box, BoxProps, Text } from '@chakra-ui/react'
import { OutgoingLink } from '@47ng/chakra-next'

export interface FooterProps extends BoxProps {}

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
          href="https://github.com/franky47/gitcms"
          textDecor="underline"
        >
          GitHub
        </OutgoingLink>
      </Text>
    </Box>
  )
}
