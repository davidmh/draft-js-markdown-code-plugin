import { DraftDecorator } from 'draft-js'
import Image from '../components/Image'

const createImageDecorator = (): DraftDecorator => ({
  strategy: (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'IMG'
      )
    }, callback)
  },
  component: Image
})

export default createImageDecorator
