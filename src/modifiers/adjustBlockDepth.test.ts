import { createEvent as createEventImpl } from '@testing-library/react'
import Draft, { EditorState, SelectionState } from 'draft-js'
import adjustBlockDepth from './adjustBlockDepth'

const LIST_KINDS = [
  'unordered-list-item',
  'ordered-list-item',
  'checkable-list-item'
]

describe('adjustBlockDepth', () => {
  const createEvent = () =>
    createEventImpl('keyDown', window, {
      shiftKey: false
    }) as any as React.KeyboardEvent<Element>
  const rawContentState = (
    type: string,
    ...depths: number[]
  ): Draft.RawDraftContentState => ({
    entityMap: {},
    blocks: depths.map<Draft.RawDraftContentBlock>((depth, i) => ({
      key: `item${i}`,
      text: `test ${i}`,
      type,
      depth,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }))
  })
  const selectionState = new SelectionState({
    anchorKey: 'item1',
    anchorOffset: 0,
    focusKey: 'item1',
    focusOffset: 0,
    isBackward: false,
    hasFocus: true
  })
  const createEditorState = (type: string, ...depths: number[]) => {
    const contentState = Draft.convertFromRaw(rawContentState(type, ...depths))
    return EditorState.forceSelection(
      EditorState.createWithContent(contentState),
      selectionState
    )
  }
  describe('non list item', () => {
    it('does not add depth', () => {
      const event = createEvent()
      const editorState = createEditorState('unstyled', 0, 0)
      const newEditorState = adjustBlockDepth(editorState, event)
      expect(newEditorState).toEqual(editorState)
      expect(
        Draft.convertToRaw(newEditorState.getCurrentContent())
      ).toMatchObject(rawContentState('unstyled', 0, 0))
    })
  })
  LIST_KINDS.forEach((type) => {
    describe(type, () => {
      it('adds depth', () => {
        const event = createEvent()
        const editorState = createEditorState(type, 0, 0)
        const newEditorState = adjustBlockDepth(editorState, event)
        expect(newEditorState).not.toEqual(editorState)
        expect(
          Draft.convertToRaw(newEditorState.getCurrentContent())
        ).toMatchObject(rawContentState(type, 0, 1))
      })
    })
  })
})
