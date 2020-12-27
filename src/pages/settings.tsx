import React from 'react'
import { NextPage } from 'next'
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
  useToast,
} from '@chakra-ui/react'
import { FiUploadCloud } from 'react-icons/fi'
import { OutgoingLink } from '@47ng/chakra-next'
import { useLocalSetting } from 'src/hooks/useLocalSetting'
import { useGitRowsTest } from 'src/hooks/useGitRows'
import { settings, settingsDefaults } from 'src/settings'
import { Layout } from 'src/components/Layout'

const SettingsPage: NextPage = () => {
  const toast = useToast({ variant: 'left-accent', position: 'bottom-right' })
  const [autoUnfurl, setAutoUnfurl] = useLocalSetting(
    settings.AUTO_UNFURL,
    false
  )
  const [token, setToken] = useLocalSetting(settings.TOKEN)
  const [repoSlug, setRepoSlug] = useLocalSetting(settings.REPO_SLUG)
  const [filePath, setFilePath] = useLocalSetting(settings.FILE_PATH)
  const [author, setAuthor] = useLocalSetting(
    settings.AUTHOR,
    settingsDefaults.AUTHOR
  )
  const [branch, setBranch] = useLocalSetting(
    settings.BRANCH,
    settingsDefaults.BRANCH
  )
  const [username, setUsername] = useLocalSetting(settings.USERNAME)
  const [loading, setLoading] = React.useState(false)

  const test = useGitRowsTest()
  const testConnection = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    test(filePath)
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
                  <OutgoingLink
                    href={`https://github.com/${repoSlug}/blob/${branch}/${filePath}`}
                  >
                    <Code lineHeight={1.6} fontSize="xs" px={2}>
                      {repoSlug}
                    </Code>
                  </OutgoingLink>
                  {' on branch '}
                  <Code lineHeight={1.6} fontSize="xs" px={2}>
                    {branch}
                  </Code>
                  <br />
                  {' in file '}
                  <OutgoingLink
                    href={`https://github.com/${repoSlug}/blob/${branch}/${filePath}`}
                  >
                    <Code lineHeight={1.6} fontSize="xs" px={2}>
                      {filePath}
                    </Code>
                  </OutgoingLink>
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
        <Divider />
        <Heading as="h3" fontSize="2xl">
          Connect your repository
        </Heading>
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
              href="https://github.com/settings/tokens"
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
          <FormLabel>Repository</FormLabel>
          <Input
            value={repoSlug ?? ''}
            onChange={(e) => setRepoSlug(e.target.value)}
            fontFamily="mono"
            placeholder="foo/bar"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>File Path</FormLabel>
          <Input
            value={filePath ?? ''}
            onChange={(e) => setFilePath(e.target.value)}
            fontFamily="mono"
            placeholder="links.csv"
          />
          <FormHelperText>
            Path to a CSV file in your repo. Must exist and have the following
            header:
            <br />
            <Code
              px={2}
              py={1}
              mt={2}
              opacity={0.75}
              fontSize="xs"
              fontWeight="medium"
            >
              timestamp,url,author,date,description,image,title
            </Code>
          </FormHelperText>
        </FormControl>
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
        <FormControl mb={4}>
          <FormLabel>Git Branch</FormLabel>
          <Input
            value={branch ?? ''}
            onChange={(e) => setBranch(e.target.value)}
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="green"
          isLoading={loading}
          leftIcon={<FiUploadCloud />}
        >
          Test Connection
        </Button>
      </Stack>
    </Layout>
  )
}

export default SettingsPage
