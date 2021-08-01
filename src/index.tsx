import { Map } from 'immutable'
import { EditorPlugin } from '@draft-js-plugins/editor'
import {
  blockRenderMap as checkboxBlockRenderMap,
  CheckableListItem,
  CheckableListItemUtils,
  CHECKABLE_LIST_ITEM
} from 'draft-js-checkable-list-item'
import adjustBlockDepth from './modifiers/adjustBlockDepth'
import checkCharacterForState from './modifiers/checkCharacterForState'
import checkReturnForState from './modifiers/checkReturnForState'
import createImageDecorator from './decorators/createImageDecorator'
import createLinkDecorator from './decorators/createLinkDecorator'
import insertEmptyBlock from './modifiers/insertEmptyBlock'
import { replaceText } from './utils'

const createMardownCodePlugin = (): EditorPlugin => ({
  blockRenderMap: Map<Draft.DraftBlockType, Draft.DraftBlockRenderConfig>({
    'code-block': {
      element: 'code',
      wrapper: <pre />
    }
  }).merge(checkboxBlockRenderMap),
  decorators: [createLinkDecorator(), createImageDecorator()],
  blockStyleFn(block) {
    if (block.getType() === CHECKABLE_LIST_ITEM) {
      return CHECKABLE_LIST_ITEM
    }
    return undefined
  },

  blockRendererFn(block, { getEditorState, setEditorState }) {
    switch (block.getType()) {
      case CHECKABLE_LIST_ITEM: {
        return {
          component: CheckableListItem,
          props: {
            onChangeChecked: () => {
              setEditorState(
                CheckableListItemUtils.toggleChecked(getEditorState(), block)
              )
            },
            checked: !!block.getData().get('checked')
          }
        }
      }
      default:
      return null
    }
  },
  keyBindingFn(ev, { getEditorState, setEditorState }) {
    if (ev.key === 'Tab') {
      const editorState = getEditorState()
      const newEditorState = adjustBlockDepth(editorState, ev)
      if (newEditorState !== editorState) {
        setEditorState(newEditorState)
        return 'handled'
      }
    }
    return undefined
  },
  handleReturn(evt, editorState, { setEditorState }) {
    const newEditorState = checkReturnForState(editorState, evt)
    if (editorState !== newEditorState) {
      setEditorState(newEditorState)
      return 'handled'
    }
    return 'not-handled'
  },
  handleBeforeInput(character, editorState, _, { setEditorState }) {
    if (character.match(/[A-z0-9_*~`]/)) {
      return 'not-handled'
    }
    const newEditorState = checkCharacterForState(editorState, character)
    if (editorState !== newEditorState) {
      setEditorState(newEditorState)
      return 'handled'
    }
    return 'not-handled'
  },
  handlePastedText(text, html, editorState, { setEditorState }) {
    if (html || !text) {
      return 'not-handled'
    }

    let newEditorState = editorState
    let buffer = []
    for (let i = 0; i < text.length; i += 1) {
      // eslint-disable-line no-plusplus
      if (text[i].match(/[^A-z0-9_*~`]/)) {
        newEditorState = replaceText(
          newEditorState,
          buffer.join('') + text[i]
        )
        newEditorState = checkCharacterForState(newEditorState, text[i])
        buffer = []
      } else if (text[i].charCodeAt(0) === 10) {
        newEditorState = replaceText(newEditorState, buffer.join(''))
        const tmpEditorState = checkReturnForState(newEditorState)
        if (newEditorState === tmpEditorState) {
          newEditorState = insertEmptyBlock(tmpEditorState)
        } else {
          newEditorState = tmpEditorState
        }
        buffer = []
      } else if (i === text.length - 1) {
        newEditorState = replaceText(
          newEditorState,
          buffer.join('') + text[i]
        )
        buffer = []
      } else {
        buffer.push(text[i])
      }
    }

    if (editorState !== newEditorState) {
      setEditorState(newEditorState)
      return 'handled'
    }
    return 'not-handled'
  }
});

export default createMardownCodePlugin;
