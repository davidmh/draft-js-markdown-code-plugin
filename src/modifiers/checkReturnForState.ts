import { EditorState } from 'draft-js'
import handleNewCodeBlock from './handleNewCodeBlock'
import insertEmptyBlock from './insertEmptyBlock'
import leaveList from './leaveList'
import handleInlineStyle from './handleInlineStyle'
import changeCurrentBlockType from './changeCurrentBlockType'
import insertText from './insertText'

export default function checkReturnForState(
  editorState: EditorState,
  evt?: React.KeyboardEvent<Element>
) {
  let newEditorState = editorState
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const key = selection.getStartKey()
  const currentBlock = contentState.getBlockForKey(key)
  const type = currentBlock.getType()
  const text = currentBlock.getText()
  if (/-list-item$/.test(type) && text === '') {
    newEditorState = leaveList(editorState)
  }
  if (
    newEditorState === editorState &&
    (evt?.shiftKey ||
      (/^header-/.test(type) &&
        selection.isCollapsed() &&
        selection.getEndOffset() === text.length))
  ) {
    newEditorState = insertEmptyBlock(editorState)
  }
  if (
    newEditorState === editorState &&
    type !== 'code-block' &&
    /^```([\w-]+)?$/.test(text)
  ) {
    newEditorState = handleNewCodeBlock(editorState)
  }
  if (newEditorState === editorState && type === 'code-block') {
    if (/```\s*$/.test(text)) {
      newEditorState = changeCurrentBlockType(
        newEditorState,
        type,
        text.replace(/\n```\s*$/, '')
      )
      newEditorState = insertEmptyBlock(newEditorState)
    } else {
      newEditorState = insertText(editorState, '\n')
    }
  }
  if (editorState === newEditorState) {
    newEditorState = handleInlineStyle(editorState, '\n')
  }
  return newEditorState
}
