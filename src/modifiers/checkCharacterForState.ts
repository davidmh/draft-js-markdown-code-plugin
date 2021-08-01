import { EditorState } from 'draft-js'
import handleBlockType from './handleBlockType'
import handleImage from './handleImage'
import handleInlineStyle from './handleInlineStyle'
import handleLink from './handleLink'

export default function checkCharacterForState(
  editorState: EditorState,
  character: string
) {
  let newEditorState = handleBlockType(editorState, character)
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const key = selection.getStartKey()
  const currentBlock = contentState.getBlockForKey(key)
  const type = currentBlock.getType()
  if (editorState === newEditorState) {
    newEditorState = handleImage(editorState, character)
  }
  if (editorState === newEditorState) {
    newEditorState = handleLink(editorState, character)
  }
  if (editorState === newEditorState && type !== 'code-block') {
    newEditorState = handleInlineStyle(editorState, character)
  }
  return newEditorState
}
