type Props = {
  entityKey: string
  children: React.ReactNode
  contentState: Draft.ContentState
}

export default function Image({ entityKey, children, contentState }: Props) {
  const { src, alt, title } = contentState.getEntity(entityKey).getData()
  return (
    <span>
      {children}
      <img src={src} alt={alt} title={title} />
    </span>
  )
}
