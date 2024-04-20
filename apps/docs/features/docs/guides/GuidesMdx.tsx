import matter from 'gray-matter'
import { type SerializeOptions } from 'next-mdx-remote/dist/types'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { readFile } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { type ComponentProps } from 'react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import { type CodeHikeConfig, remarkCodeHike } from '@code-hike/mdx'
import remarkMath from 'remark-math'
import { GlassPanel } from 'ui-patterns/GlassPanel'
import { IconPanel } from 'ui-patterns/IconPanel'
import { Admonition } from 'ui/server'

import { AppleSecretGenerator } from '~/components/AppleSecretGenerator'
import AuthProviders from '~/components/AuthProviders'
import { Heading } from '~/components/CustomHTMLElements'
import {
  GetSessionWarning,
  SocialProviderSettingsSupabase,
  SocialProviderSetup,
} from '~/components/MDX/partials'
import { Mermaid } from '~/components/Mermaid'
import { NavData } from '~/components/NavData'
import { ProjectConfigVariables } from '~/components/ProjectConfigVariables'
import StepHikeCompact from '~/components/StepHikeCompact'
import { Accordion, AccordionItem } from '~/features/ui/Accordion'
import * as CH from '~/features/ui/CodeHike'
import { Tabs, TabPanel } from '~/features/ui/Tabs'
import { GUIDES_DIRECTORY, isValidGuideFrontmatter } from '~/lib/docs'

import codeHikeTheme from 'config/code-hike.theme.json' assert { type: 'json' }

const codeHikeOptions: CodeHikeConfig = {
  theme: codeHikeTheme,
  lineNumbers: true,
  showCopyButton: true,
  skipLanguages: [],
  autoImport: false,
}

const mdxOptions: SerializeOptions = {
  mdxOptions: {
    useDynamicImport: true,
    remarkPlugins: [
      [remarkMath, { singleDollarTextMath: false }],
      remarkGfm,
      [remarkCodeHike, codeHikeOptions],
    ],
    rehypePlugins: [rehypeKatex as any],
  },
}

const getGuidesMarkdown = async (section: string, params: { slug?: string[] }) => {
  const relPath = (section + '/' + (params?.slug?.join(sep) ?? '')).replace(/\/$/, '')
  const fullPath = join(GUIDES_DIRECTORY, relPath + '.mdx')
  /**
   * SAFETY CHECK:
   * Prevent accessing anything outside of GUIDES_DIRECTORY
   */
  if (!fullPath.startsWith(GUIDES_DIRECTORY)) {
    throw Error('Accessing forbidden route. Content must be within the GUIDES_DIRECTORY.')
  }

  const mdx = await readFile(fullPath, 'utf-8')

  const editLink = `supabase/supabase/blob/master/apps/docs/content/guides/${relPath}.mdx`

  const { data: frontmatter, content } = matter(mdx)
  if (!isValidGuideFrontmatter(frontmatter)) {
    throw Error('Type of frontmatter is not valid')
  }

  return {
    pathname: relPath,
    frontmatter,
    content,
    editLink,
  }
}

const components = {
  Accordion,
  AccordionItem,
  Admonition,
  AppleSecretGenerator,
  AuthProviders,
  CH,
  GetSessionWarning,
  GlassPanel,
  IconPanel,
  Link,
  Mermaid,
  NavData,
  ProjectConfigVariables,
  SocialProviderSettingsSupabase,
  SocialProviderSetup,
  StepHikeCompact,
  Tabs,
  TabPanel,
  h2: (props: any) => (
    <Heading tag="h2" {...props}>
      {props.children}
    </Heading>
  ),
  h3: (props: any) => (
    <Heading tag="h3" {...props}>
      {props.children}
    </Heading>
  ),
  h4: (props: any) => (
    <Heading tag="h4" {...props}>
      {props.children}
    </Heading>
  ),
}

const MDXRemoteGuides = (props: ComponentProps<typeof MDXRemote>) => (
  <MDXRemote components={components} options={mdxOptions} {...props} />
)

export { MDXRemoteGuides, getGuidesMarkdown }
