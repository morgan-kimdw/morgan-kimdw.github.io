import process from 'node:process'

import siteMetadata from '../data/siteMetadata.js'
import { validateCommentsConfig } from '../lib/comments/config.mjs'

const result = validateCommentsConfig(siteMetadata.comments)
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
if (!result.ok) process.exitCode = 1
