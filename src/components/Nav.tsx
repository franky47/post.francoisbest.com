import React from 'react'
import { Box, Flex, BoxProps, chakra } from '@chakra-ui/react'
import { NavLink, navLinkMatch } from '@47ng/chakra-next'
import { FiCheckSquare, FiSettings } from 'react-icons/fi'

export interface NavProps extends BoxProps {}

const Icon = chakra(Box, {
  baseStyle: {
    display: 'inline',
    mr: 2,
    verticalAlign: 'sub',
  },
})

export const Nav: React.FC<NavProps> = ({ ...props }) => {
  return (
    <Flex as="nav" justifyContent="space-between" {...props}>
      <NavLink to="/" shouldBeActive={navLinkMatch.exact}>
        <Icon as={FiCheckSquare} />
        Post
      </NavLink>
      <NavLink to="/settings">
        <Icon as={FiSettings} />
        Settings
      </NavLink>
    </Flex>
  )
}
