export default function imageStrategy(
  contentBlock: Draft.ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: Draft.ContentState
) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'IMG'
    )
  }, callback)
}
