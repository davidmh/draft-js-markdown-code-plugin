export default function linkStrategy(
  block: Draft.ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: Draft.ContentState
) {
  block.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    )
  }, callback)
}
