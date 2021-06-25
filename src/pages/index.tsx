import { OutgoingLink } from '@47ng/chakra-next'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import React from 'react'
import { FiCheckSquare, FiDownloadCloud, FiX } from 'react-icons/fi'
import { useDebounce } from 'react-use'
import { csvColumns, settings } from 'src/client/settings'
import type { Metadata } from 'src/client/unfurl'
import { unfurl } from 'src/client/unfurl'
import { Layout } from 'src/components/Layout'
import { OgImagePreview } from 'src/components/OgImagePreview'
import { Stats, useStats } from 'src/components/Stats'
import { DatePicker } from 'src/components/date-picker/DatePicker'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useGitRowsHasURL, useGitRowsPush } from 'src/hooks/useGitRows'
import { useLocalSetting } from 'src/hooks/useLocalSetting'

export default function Home() {
  useAuthRedirect()
  const toast = useToast({ variant: 'left-accent', position: 'bottom-right' })
  const [url, setUrl] = React.useState('')
  const [autoUnfurl] = useLocalSetting(settings.AUTO_UNFURL, false)
  const [isUnfurling, setUnfurling] = React.useState(false)
  const [postDate, setPostDate] = React.useState(new Date())
  const [meta, setMeta] = React.useState<Partial<Metadata>>({})
  const placeholder = isUnfurling ? 'Loading...' : undefined
  const checkDuplicate = useGitRowsHasURL()
  const [duplicate, setDuplicate] = React.useState(false)
  const push = useGitRowsPush(csvColumns)
  const [pushing, setPushing] = React.useState(false)
  const [stats, updateStats] = useStats()

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

  const runUnfurling = React.useCallback(() => {
    if (!url) {
      return
    }
    setUnfurling(true)
    unfurl(url)
      .then(setMeta)
      .catch(console.error)
      .finally(() => setUnfurling(false))
  }, [url, unfurl])
  const reset = React.useCallback(() => {
    setUrl('')
    setMeta({})
    setPostDate(new Date())
    window.scrollTo({ top: 0, behavior: 'smooth' })
    updateStats()
  }, [updateStats])

  const submit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setPushing(true)
      push(
        {
          timestamp: postDate.getTime(),
          ...meta,
          url,
        },
        {
          message: `gitrows: Add ${url}`,
        }
      )
        .then(() => {
          toast({
            status: 'success',
            title: 'Link posted',
            isClosable: true,
            duration: 1500,
          })
          reset()
        })
        .catch(console.error)
        .finally(() => setPushing(false))
    },
    [push, toast, reset, meta, url, postDate]
  )

  React.useEffect(() => {
    updateStats()
  }, [updateStats])

  return (
    <Layout title="Post new link">
      <Stack as="form" spacing={6} onSubmit={submit}>
        <Stats {...stats} />
        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <InputGroup>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              size="lg"
              isInvalid={duplicate}
              onPaste={(event) => {
                event.preventDefault()
                const pastedText = event.clipboardData.getData('text')
                const url = new URL(pastedText)
                url.searchParams.delete('utm_source')
                setUrl(url.toString())
              }}
            />
            <InputRightElement boxSize={12}>
              <IconButton
                onClick={duplicate ? reset : runUnfurling}
                rounded="full"
                variant="ghost"
                icon={duplicate ? <FiX /> : <FiDownloadCloud />}
                aria-label={duplicate ? 'Clear' : 'Unfurl'}
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
            <Textarea
              resize="vertical"
              rows={2}
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
              minH={[48, 32]}
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
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Property</Th>
              <Th>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Publication Date</Td>
              <Td>{meta.date}</Td>
            </Tr>
            <Tr>
              <Td>Twitter</Td>
              <Td>
                <OutgoingLink href={`https://twitter.com/${meta.twitter}`}>
                  {meta.twitter && `@${meta.twitter}`}
                </OutgoingLink>
              </Td>
            </Tr>
            <Tr>
              <Td>Language</Td>
              <Td>{meta.lang}</Td>
            </Tr>
            <Tr>
              <Td>Logo</Td>
              <Td>
                {meta.logo && (
                  <Image
                    src={meta.logo}
                    alt="Website logo or icon"
                    boxSize="24px"
                  />
                )}
              </Td>
            </Tr>
            <Tr>
              <Td>
                <label htmlFor="post-date">Post Date</label>
              </Td>
              <Td>
                <DatePicker
                  id="post-date"
                  // ISO standard should be less confusing for the order of the dates https://en.wikipedia.org/wiki/ISO_8601
                  dateFormat="yyyy-MM-dd"
                  selected={postDate}
                  onChange={(date: Date) =>
                    date ? setPostDate(date) : setPostDate(new Date())
                  }
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
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
          zIndex="sticky"
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
