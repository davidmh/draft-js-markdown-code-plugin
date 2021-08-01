import { EditorState } from 'draft-js'

export default function changeCurrentBlockType(
  editorState: EditorState,
  type: string | null,
  text: string,
  blockMetadata = {}
) {
  const currentContent = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const key = selection.getStartKey()
  const blockMap = currentContent.getBlockMap()
  const block = blockMap.get(key)
  const data = block.getData().merge(blockMetadata)
  const newBlock = block.merge({ type, data, text: text || '' }) as typeof block
  const newSelection = selection.merge({
    anchorOffset: 0,
    focusOffset: 0
  })
  const newContentState = currentContent.merge({
    blockMap: blockMap.set(key, newBlock),
    selectionAfter: newSelection
  }) as typeof currentContent
  return EditorState.push(editorState, newContentState, 'change-block-type')
}
