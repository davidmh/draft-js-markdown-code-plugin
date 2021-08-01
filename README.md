# draft-js-markdown-code-plugin

A [DraftJS][1] plugin for supporting Markdown syntax shortcuts.

This plugin works with [DraftJS Plugins][2] wrapper component.

This is a fork of [ngs/draft-js-markdown-shortcuts-plugin][3], which hasn't
merged PRs in a while.

This fork includes:

- Dependency updates
- Typescript support
- Resolved deprecation warnings

TODO:

- [ ] Port tests
- [ ] Add custom components to render links and images

## Install

```bash
yarn add draft-js-markdown-code-plugin
```

## Usage

```tsx
import Editor from '@draft-js-plugins/editor';
import createMarkdownCodePlugin from 'draft-js-markdown-code-plugin';
import './CheckableList.css';

const [editorState, setEditorState] = useState(
  () => EditorState.createWithContent(ContentState.createFromText(''))
);
const plugins = [createMarkdownCodePlugin()];

export default function Example() {
  return (
    <Editor
      editorState={editorState}
      onChange={setEditorState}
      placeholder="Write something here..."
      plugins={plugins}
    />
  )
}
```

`CheckableList.css`

```css
.checkable-list-item {
  list-style: none;
  transform: translateX(-1.5em);
}
.checkable-list-item-block__checkbox {
  position: absolute;
  z-index: 1;
  cursor: default;
}
.checkable-list-item-block__text {
  padding-left: 1.5em;
}
```

## License

MIT © [davidmh](https://github.com/davidmh)

[1]: https://facebook.github.io/draft-js/
[2]: https://github.com/draft-js-plugins/draft-js-plugins
[3]: https://github.com/ngs/draft-js-markdown-shortcuts-plugin
