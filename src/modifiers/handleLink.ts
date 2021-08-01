import insertLink from './insertLink'
import { EditorState } from 'draft-js'

export default function handleLink(
  editorState: EditorState,
  character: string
) {
  const re = /\[([^\]]+)]\(([^)"]+)(?: "([^"]+)")?\)/g
  const key = editorState.getSelection().getStartKey()
  const text = editorState.getCurrentContent().getBlockForKey(key).getText()
  const line = `${text}${character}`
  let newEditorState = editorState
  let matchArr: RegExpMatchArray | null
  do {
    matchArr = re.exec(line)
    if (matchArr) {
      newEditorState = insertLink(newEditorState, matchArr)
    }
  } while (matchArr)
  return newEditorState
}
