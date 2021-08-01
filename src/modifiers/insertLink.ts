import { EditorState, RichUtils, SelectionState, Modifier } from 'draft-js'

export default function insertLink(
  editorState: EditorState,
  matchArr: RegExpMatchArray
) {
  const currentContent = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const key = selection.getStartKey()
  const [matchText, text, href, title] = matchArr
  const { index = 0 } = matchArr
  const focusOffset = index + matchText.length
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset
  })
  const nextContent = currentContent.createEntity('LINK', 'MUTABLE', {
    href,
    title
  })
  const entityKey = nextContent.getLastCreatedEntityKey()
  let newContentState = Modifier.replaceText(
    nextContent,
    wordSelection,
    text,
    undefined,
    entityKey
  )
  newContentState = Modifier.insertText(
    newContentState,
    newContentState.getSelectionAfter(),
    ' '
  )
  const newWordSelection = wordSelection.merge({
    focusOffset: index + text.length
  })
  let newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-fragment'
  )
  newEditorState = RichUtils.toggleLink(
    newEditorState,
    newWordSelection,
    entityKey
  )
  return EditorState.forceSelection(
    newEditorState,
    newContentState.getSelectionAfter()
  )
}
