import { render, screen } from '@testing-library/react'
import { ContentState } from "draft-js";
import Link from './Link'

describe('<Link />', () => {
  it('renders anchor tag', () => {
    const props = {
      href: 'http://cultofthepartyparrot.com/',
      title: 'parrot',
    }
    const contentState = ContentState.createFromText('').createEntity('LINK', 'MUTABLE', props);
    const entityKey = contentState.getLastCreatedEntityKey()

    render(
      <Link entityKey={entityKey} contentState={contentState}>
        <b>Hello</b>
      </Link>
    )


    const a = screen.getByTitle(props.title)

    expect(a).toHaveProperty('href', props.href)
    expect(a.textContent).toMatch(/Hello/)
  })
})
