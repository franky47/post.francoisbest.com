import React from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Textarea,
  Box,
  FormHelperText,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import type { Metadata } from 'metascraper'
import { FiCheckSquare, FiDownloadCloud } from 'react-icons/fi'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useGitRowsHasURL, useGitRowsPush } from 'src/hooks/useGitRows'
import { unfurl } from 'src/client/unfurl'
import { OgImagePreview } from 'src/components/OgImagePreview'
import { Layout } from 'src/components/Layout'
import { useLocalSetting } from 'src/hooks/useLocalSetting'
import { settings } from 'src/client/settings'
import { useDebounce } from 'react-use'

export default function Home() {
  useAuthRedirect()
  const toast = useToast({ variant: 'left-accent', position: 'bottom-right' })
  const [url, setUrl] = React.useState('')
  const [autoUnfurl] = useLocalSetting(settings.AUTO_UNFURL, false)
  const [isUnfurling, setUnfurling] = React.useState(false)
  const [meta, setMeta] = React.useState<Partial<Metadata>>({})
  const placeholder = isUnfurling ? 'Loading...' : undefined
  const checkDuplicate = useGitRowsHasURL()
  const [duplicate, setDuplicate] = React.useState(false)
  const push = useGitRowsPush([
    'author',
    'title',
    'description',
    'image',
    'date',
    'lang',
    'logo',
    'twitter',
    'url',
  ])
  const [pushing, setPushing] = React.useState(false)

  useDebounce(
    () => {
      if (!autoUnfurl) {
        return
      }
      if (!url) {
        setMeta({})
      } else {
        runUnfurling()
      }
    },
    500,
    [url, autoUnfurl]
  )

  useDebounce(
    () => {
      if (!url) {
        setDuplicate(false)
        return
      }
      checkDuplicate(url)
        .then((result) => {
          setDuplicate(!!result)
        })
        .catch(console.error)
    },
    500,
    [url, checkDuplicate]
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setPushing(true)
    push(
      {
        ...meta,
        url,
      },
      {
        message: `gitrows: Add ${url}`,
      }
    )
      .then(reset)
      .catch(console.error)
      .finally(() => setPushing(false))
  }
  const runUnfurling = () => {
    if (!url) {
      return
    }
    setUnfurling(true)
    unfurl(url)
      .then(setMeta)
      .catch(console.error)
      .finally(() => setUnfurling(false))
  }
  const reset = () => {
    toast({
      status: 'success',
      title: 'Link posted',
      isClosable: true,
      duration: 1500,
    })
    setUrl('')
    setMeta({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout title="Post new link">
      <Stack as="form" spacing={6} onSubmit={submit}>
        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <InputGroup>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              size="lg"
              isInvalid={duplicate}
            />
            <InputRightElement boxSize={12}>
              <IconButton
                onClick={runUnfurling}
                rounded="full"
                variant="ghost"
                icon={<FiDownloadCloud />}
                aria-label="Unfurl"
              />
            </InputRightElement>
          </InputGroup>
          {duplicate && (
            <FormHelperText color="red.400">
              This link was already saved.
            </FormHelperText>
          )}
          <FormHelperText>
            Click the cloud icon to populate fields from the URL.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Title</FormLabel>
          <InputGroup>
            <Input
              placeholder={placeholder}
              value={meta.title ?? ''}
              onChange={(e) =>
                setMeta((meta) => ({ ...meta, title: e.target.value }))
              }
            />
            {isUnfurling && (
              <InputRightElement>
                <Box>
                  <Spinner size="sm" />
                </Box>
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Author</FormLabel>
          <InputGroup>
            <Input
              placeholder={placeholder}
              value={meta.author ?? ''}
              onChange={(e) =>
                setMeta((meta) => ({ ...meta, author: e.target.value }))
              }
            />
            {isUnfurling && (
              <InputRightElement>
                <Box>
                  <Spinner size="sm" />
                </Box>
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Box pos="relative">
            <Textarea
              placeholder={placeholder}
              value={meta.description ?? ''}
              onChange={(e) =>
                setMeta((meta) => ({ ...meta, description: e.target.value }))
              }
            />
            {isUnfurling && (
              <Spinner size="sm" pos="absolute" right={3} top={3} />
            )}
          </Box>
        </FormControl>
        <Box mb={4}>
          <Heading as="h3" fontSize="lg" mb={4}>
            OpenGraph Image Preview
          </Heading>
          <OgImagePreview loading={isUnfurling} src={meta.image ?? ''} />
        </Box>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<FiCheckSquare />}
          size="lg"
          display={['none', 'flex']}
          isLoading={pushing}
          isDisabled={!url || duplicate}
        >
          Post Link
        </Button>
        <IconButton
          type="submit"
          aria-label="Post"
          display={url ? ['flex', 'none'] : 'none'}
          position="fixed"
          bottom={4}
          right={4}
          icon={<FiCheckSquare size={24} />}
          boxSize="64px"
          rounded="full"
          colorScheme="green"
          shadow="lg"
          isLoading={pushing}
          isDisabled={duplicate}
        />
      </Stack>
    </Layout>
  )
}
