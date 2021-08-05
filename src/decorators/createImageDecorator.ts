import { DraftDecorator } from 'draft-js'
import Image from '../components/Image'
import imageStrategy from './imageStrategy'

const createImageDecorator = (): DraftDecorator => ({
  strategy: imageStrategy,
  component: Image
})

export default createImageDecorator
