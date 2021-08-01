import Editor from '@draft-js-plugins/editor'
import { useState, useRef } from 'react'
import { ContentState, EditorState } from 'draft-js'
import createMarkdownCodePlugin from 'draft-js-markdown-code-plugin'
import 'draft-js/dist/Draft.css'
import './App.css'
import './CheckableList.css'

const plugins = [createMarkdownCodePlugin()]

export default function DemoEditor() {
  const editorRef = useRef<Editor | null>(null)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(''))
  )

  return (
    <Editor
      ref={editorRef}
      editorState={editorState}
      onChange={setEditorState}
      placeholder='Write something here...'
      plugins={plugins}
      spellCheck
    />
  )
}
