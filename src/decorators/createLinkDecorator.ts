import { DraftDecorator } from 'draft-js'
import Link from '../components/Link'

const createLinkDecorator = (): DraftDecorator => {
  return {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity()
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'LINK'
        )
      }, callback)
    },
    component: Link
  }
}

export default createLinkDecorator
