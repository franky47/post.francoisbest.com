import { OutgoingLink } from '@47ng/chakra-next'
import {
  Button,
  Checkbox,
  Code,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import React from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import { csvColumns, settings, settingsDefaults } from 'src/client/settings'
import { Layout } from 'src/components/Layout'
import { useGitHubURL } from 'src/hooks/useGitHubURL'
import { useGitRowsTest } from 'src/hooks/useGitRows'
import { useLocalSetting } from 'src/hooks/useLocalSetting'

const SettingsPage: NextPage = () => {
  const toast = useToast({ variant: 'left-accent', position: 'bottom-right' })
  const [autoUnfurl, setAutoUnfurl] = useLocalSetting(
    settings.AUTO_UNFURL,
    false
  )
  const { colorMode, setColorMode } = useColorMode()
  const [token, setToken] = useLocalSetting(settings.TOKEN)
  const [fileURL, setFileURL] = useLocalSetting(settings.FILE_URL)
  const [author, setAuthor] = useLocalSetting(
    settings.AUTHOR,
    settingsDefaults.AUTHOR
  )
  const [username, setUsername] = useLocalSetting(settings.USERNAME)
  const [loading, setLoading] = React.useState(false)
  const meta = useGitHubURL(fileURL)
  const test = useGitRowsTest()
  const testConnection = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    test()
      .then((result: any) => {
        if (result.valid) {
          toast({
            isClosable: true,
            status: 'success',
            title: 'Repository connected',
            description: (
              <>
                <Text fontSize="sm">
                  Links will be saved in
                  <br />
                  <Code lineHeight={1.6} fontSize="xs" px={2}>
                    {meta?.slug}
                  </Code>
                  {' on branch '}
                  <Code lineHeight={1.6} fontSize="xs" px={2}>
                    {meta?.branch}
                  </Code>
                  <br />
                  {' in file '}
                  <Code lineHeight={1.6} fontSize="xs" px={2}>
                    {meta?.path}
                  </Code>
                </Text>
              </>
            ),
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  return (
    <Layout title="Settings">
      <Stack as="form" spacing={6} onSubmit={testConnection}>
        <FormControl>
          <Checkbox
            isChecked={autoUnfurl}
            onChange={(e) => setAutoUnfurl(e.target.checked)}
          >
            Auto unfurl
          </Checkbox>
          <FormHelperText>
            Automatically fetch metadata when pasting a link
          </FormHelperText>
        </FormControl>
        <FormControl>
          <Checkbox
            isChecked={colorMode === 'dark'}
            onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
          >
            Dark mode
          </Checkbox>
        </FormControl>
        <Divider />
        <Heading as="h3" fontSize="2xl">
          Connect your repository
        </Heading>
        <Text color="gray.300">
          Your unfurled links are committed to a CSV file in a GitHub
          repository.
        </Text>
        <FormControl isRequired>
          <FormLabel>GitHub Token</FormLabel>
          <Input
            value={token ?? ''}
            onChange={(e) => setToken(e.target.value)}
            fontFamily="mono"
            placeholder="•••••••••"
            type="password"
          />
          <FormHelperText>
            Generate a{' '}
            <OutgoingLink
              href="https://github.com/settings/tokens/new?scopes=repo,read:repo_hook&description=GitRows%20(post.francoisbest.com)"
              textDecor="underline"
            >
              Personal Access Token
            </OutgoingLink>{' '}
            and paste it here.
            <br />
            <br />
            Your token is stored on this device and is only sent to GitHub.
          </FormHelperText>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>File URL</FormLabel>
          <Input
            value={fileURL ?? ''}
            onChange={(e) => setFileURL(e.target.value)}
            fontFamily="mono"
            placeholder="https://github.com/owner/repo/blob/branch/file.csv"
          />
          <FormHelperText>
            Full URL to a CSV file in a GitHub repository. Must have the
            following header:
            <br />
            <Code
              px={2}
              py={1}
              mt={2}
              opacity={0.75}
              fontSize="xs"
              fontWeight="medium"
              wordBreak="break-word"
            >
              {csvColumns.join(',')}
            </Code>
          </FormHelperText>
        </FormControl>
        <Button
          type="submit"
          colorScheme="green"
          isLoading={loading}
          leftIcon={<FiUploadCloud />}
        >
          Test Connection
        </Button>
        <Divider />
        <Heading as="h3" fontSize="2xl">
          Git Settings
        </Heading>
        <FormControl>
          <FormLabel>GitHub Username</FormLabel>
          <Input
            value={username ?? ''}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FormHelperText>
            The GitHub username associated to the token, required if using a
            private repo.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Commit Author Name</FormLabel>
          <Input
            value={author.name ?? ''}
            onChange={(e) => setAuthor({ ...author, name: e.target.value })}
          />
          <FormHelperText>
            This name will be shown as the author of file update commits
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Commit Author Email</FormLabel>
          <Input
            value={author.email ?? ''}
            onChange={(e) => setAuthor({ ...author, email: e.target.value })}
          />
        </FormControl>
      </Stack>
    </Layout>
  )
}

export default SettingsPage
