import { Map } from 'immutable'
import { EditorPlugin, GetSetEditorState } from '@draft-js-plugins/editor'
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

type Options = {
  /** @default true */
  insertEmptyBlockOnReturnWithModifierKey?: boolean
}

const createMardownCodePlugin = ({
  insertEmptyBlockOnReturnWithModifierKey = true
}: Options = {}): EditorPlugin => {
  // We keep this version of the store to be able to inject function spies in
  // the tests.
  const store = {} as GetSetEditorState

  return {
    initialize({ getEditorState, setEditorState }) {
      store.getEditorState = getEditorState
      store.setEditorState = setEditorState
    },
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

    blockRendererFn(block) {
      switch (block.getType()) {
        case CHECKABLE_LIST_ITEM: {
          return {
            component: CheckableListItem,
            props: {
              onChangeChecked: () => {
                store.setEditorState(
                  CheckableListItemUtils.toggleChecked(
                    store.getEditorState(),
                    block
                  )
                )
              },
              checked: !!block.getData().get('checked'),
            }
          }
        }
        default:
          return null
      }
    },
    keyBindingFn(ev) {
      if (ev.key === 'Tab') {
        const editorState = store.getEditorState()
        const newEditorState = adjustBlockDepth(editorState, ev)
        if (newEditorState !== editorState) {
          store.setEditorState(newEditorState)
          return 'handled'
        }
      }
      return undefined
    },
    handleReturn(evt, editorState) {
      const newEditorState = checkReturnForState(
        editorState,
        evt,
        insertEmptyBlockOnReturnWithModifierKey
      )
      if (editorState !== newEditorState) {
        store.setEditorState(newEditorState)
        return 'handled'
      }
      return 'not-handled'
    },
    handleBeforeInput(character, editorState, _) {
      if (character.match(/[A-z0-9_*~`]/)) {
        return 'not-handled'
      }
      const newEditorState = checkCharacterForState(editorState, character)
      if (editorState !== newEditorState) {
        store.setEditorState(newEditorState)
        return 'handled'
      }
      return 'not-handled'
    },
    handlePastedText(text, html, editorState) {
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
        store.setEditorState(newEditorState)
        return 'handled'
      }
      return 'not-handled'
    }
  }
}

export default createMardownCodePlugin
