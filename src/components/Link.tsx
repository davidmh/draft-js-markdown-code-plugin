type Props = {
  contentState: Draft.ContentState
  children: React.ReactNode
  entityKey: string
}

export default function Link({ contentState, children, entityKey }: Props) {
  const { href, title } = contentState.getEntity(entityKey).getData()

  return (
    <a href={href} title={title}>
      {children}
    </a>
  )
}
