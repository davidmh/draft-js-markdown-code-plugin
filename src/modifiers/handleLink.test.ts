import Draft, { EditorState, SelectionState } from 'draft-js'
import handleLink from './handleLink'
import * as InsertLinkModule from './insertLink'

describe('handleLink', () => {
  let beforeRawContentState: Draft.RawDraftContentState
  let afterRawContentState: Draft.RawDraftContentState
  let selection: SelectionState
  let fakeInsertLink: jest.SpyInstance<
    Draft.EditorState,
    [editorState: Draft.EditorState, matchArr: RegExpMatchArray]
  >

  const createEditorState = (text: string): Draft.EditorState => {
    afterRawContentState = {
      entityMap: {},
      blocks: [
        {
          key: 'item1',
          text: 'Test',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {}
        }
      ]
    }

    beforeRawContentState = {
      entityMap: {},
      blocks: [
        {
          key: 'item1',
          text,
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {}
        }
      ]
    }

    selection = new SelectionState({
      anchorKey: 'item1',
      anchorOffset: text.length - 1,
      focusKey: 'item1',
      focusOffset: text.length - 1,
      isBackward: false,
      hasFocus: true
    })

    const contentState = Draft.convertFromRaw(beforeRawContentState)
    const editorState = EditorState.forceSelection(
      EditorState.createWithContent(contentState),
      selection
    )
    const newContentState = Draft.convertFromRaw(afterRawContentState)
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-fragment'
    )

    fakeInsertLink = jest
      .spyOn(InsertLinkModule, 'default')
      .mockReturnValue(newEditorState)

    return editorState
  }

  ;[
    ['if href only', '[hello](http://cultofthepartyparrot.com/)'],
    ['if href and title', '[hello](http://cultofthepartyparrot.com/ "world")']
  ].forEach(([condition, text]) => {
    describe(condition, () => {
      it('returns new editor state', () => {
        const editorState = createEditorState(text)
        const newEditorState = handleLink(editorState, ' ')
        expect(newEditorState).not.toEqual(editorState)
        expect(
          Draft.convertToRaw(newEditorState.getCurrentContent())
        ).toMatchObject(afterRawContentState)
        expect(fakeInsertLink).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('if does not match', () => {
    it('returns old editor state', () => {
      const editorState = createEditorState('yo')
      const newEditorState = handleLink(editorState, ' ')
      expect(newEditorState).toEqual(editorState)
      expect(fakeInsertLink).not.toHaveBeenCalled()
    })
  })
})
