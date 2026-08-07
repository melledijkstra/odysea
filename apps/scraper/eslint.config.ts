import { globalIgnores } from 'eslint/config'
import nodeConfig from '@melledijkstra/config/eslint/node.ts'

export default {
  ...nodeConfig,
  // ignore web scripts
  ...globalIgnores(['scripts/web/**']),
}
