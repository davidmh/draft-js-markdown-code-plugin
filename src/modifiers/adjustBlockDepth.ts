import { CheckableListItemUtils } from 'draft-js-checkable-list-item'
import { EditorState, RichUtils } from 'draft-js'

export default function adjustBlockDepth(
  editorState: EditorState,
  ev: React.KeyboardEvent<Element>
) {
  const newEditorState = CheckableListItemUtils.onTab(ev, editorState, 4)
  if (newEditorState !== editorState) {
    return newEditorState
  }
  // @ts-ignore - TODO: correct the ev param on onTab
  return RichUtils.onTab(ev, editorState, 4)
}
