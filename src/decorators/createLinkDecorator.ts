import { DraftDecorator } from 'draft-js'
import Link from '../components/Link'
import linkStrategy from './linkStrategy'

const createLinkDecorator = (): DraftDecorator => {
  return {
    strategy: linkStrategy,
    component: Link
  }
}

export default createLinkDecorator
