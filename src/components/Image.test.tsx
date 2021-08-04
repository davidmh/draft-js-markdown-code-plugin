import { render, screen } from '@testing-library/react'
import { ContentState } from 'draft-js'
import Image from './Image'

describe('<Image />', () => {
  it('renders image tag', () => {
    const props = {
      alt: 'Some description',
      src: 'http://cultofthepartyparrot.com/parrots/aussieparrot.gif',
      title: 'parrot',
    }
    const contentState = ContentState.createFromText('').createEntity(
      'IMG',
      'MUTABLE',
      props
    )
    const entityKey = contentState.getLastCreatedEntityKey()

    render(
      <Image entityKey={entityKey} contentState={contentState}>
        &nbsp;
      </Image>
    )

    const img = screen.getByAltText(props.alt)

    expect(img).toHaveProperty('src', props.src)
    expect(img).toHaveProperty('title', props.title)
  })
})
