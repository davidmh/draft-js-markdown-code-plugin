import { EditorState, RichUtils, SelectionState, Modifier } from 'draft-js'

export default function insertImage(
  editorState: EditorState,
  matchArr: RegExpExecArray
) {
  const currentContent = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const key = selection.getStartKey()
  const [matchText, alt, src, title] = matchArr
  const { index } = matchArr
  const focusOffset = index + matchText.length
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset
  })
  const nextContent = currentContent.createEntity('IMG', 'IMMUTABLE', {
    alt,
    src,
    title
  })
  const entityKey = nextContent.getLastCreatedEntityKey()
  let newContentState = Modifier.replaceText(
    nextContent,
    wordSelection,
    '\u200B',
    undefined,
    entityKey
  )
  newContentState = Modifier.insertText(
    newContentState,
    newContentState.getSelectionAfter(),
    ' '
  )
  const newWordSelection = wordSelection.merge({
    focusOffset: index + 1
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
