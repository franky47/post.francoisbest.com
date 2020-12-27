import React from 'react'
import { Box, Stack, BoxProps } from '@chakra-ui/react'
import { NavLink, navLinkMatch } from '@47ng/chakra-next'
import { FiCheckSquare, FiSettings } from 'react-icons/fi'

export interface NavProps extends BoxProps {}

export const Nav: React.FC<NavProps> = ({ ...props }) => {
  return (
    <Stack as="nav" direction="row" spacing={8} {...props}>
      <NavLink to="/" shouldBeActive={navLinkMatch.exact}>
        <Box as={FiCheckSquare} d="inline" mr={2} verticalAlign="sub" />
        Post
      </NavLink>
      <NavLink to="/settings">
        <Box as={FiSettings} d="inline" mr={2} verticalAlign="sub" />
        Settings
      </NavLink>
    </Stack>
  )
}
