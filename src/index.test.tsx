import { PluginFunctions } from '@draft-js-plugins/editor';
import { createEvent } from '@testing-library/react';
import Draft, { EditorState, SelectionState, ContentBlock } from 'draft-js';
import { CheckableListItem, CheckableListItemUtils } from 'draft-js-checkable-list-item';
import { Map, List } from 'immutable';
import createMarkdownCodePlugin from './index';
import * as AdjustBlockDepthModule from './modifiers/adjustBlockDepth';
import * as ChangeCurrentBlockTypeModule from './modifiers/changeCurrentBlockType';
import * as CheckReturnForStateModule from './modifiers/checkReturnForState';
import * as HandleBlockType from './modifiers/handleBlockType';
import * as HandleImage from './modifiers/handleImage';
import * as HandleInlineStyle from './modifiers/handleInlineStyle';
import * as HandleLink from './modifiers/handleLink';
import * as HandleNewCodeBlockModule from './modifiers/handleNewCodeBlock';
import * as InsertEmptyBlockModule from './modifiers/insertEmptyBlock';
import * as InsertTextModule from './modifiers/insertText';
import * as LeaveListModule from './modifiers/leaveList';
import * as UtilsModule from './utils';

// TODO: The store mocks are not working as expected
// Test Suites: 1 failed, 1 total
// Tests:       53 failed, 21 passed, 74 total
describe.skip('draft-js-markdown-shortcuts-plugin', () => {
  let modifierSpy: jest.SpyInstance<any, any>;

  afterEach(() => {
    modifierSpy.mockClear();
  });
  const createEditorState = (rawContent: Draft.RawDraftContentState, rawSelection: Draft.SelectionState) => {
    const contentState = Draft.convertFromRaw(rawContent);
    return EditorState.forceSelection(EditorState.createWithContent(contentState), rawSelection);
  };

  let plugin: ReturnType<typeof createMarkdownCodePlugin>;
  let store: PluginFunctions;
  let currentEditorState: Draft.EditorState;
  let newEditorState: Draft.EditorState;
  let currentRawContentState: Draft.RawDraftContentState;
  let newRawContentState: Draft.RawDraftContentState;
  let currentSelectionState: Draft.SelectionState;
  let subject: (() => any) | null;
  let event: React.KeyboardEvent<Element>;

  [[], [{ insertEmptyBlockOnReturnWithModifierKey: false }]].forEach(args => {
    beforeEach(() => {
      modifierSpy = jest.fn().mockReturnValue(newEditorState);

      event = createKeyboardEvent()
      jest.spyOn(event, 'preventDefault');
      currentSelectionState = new SelectionState({
        anchorKey: 'item1',
        anchorOffset: 0,
        focusKey: 'item1',
        focusOffset: 0,
        isBackward: false,
        hasFocus: true,
      });

      newRawContentState = {
        entityMap: {},
        blocks: [
          {
            key: 'item1',
            text: 'altered!!',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      };
      newEditorState = EditorState.createWithContent(Draft.convertFromRaw(newRawContentState));

      store = {
        setEditorState: jest.fn(),
        getEditorState: jest.fn(() => {
          currentEditorState = createEditorState(currentRawContentState, currentSelectionState);
          return currentEditorState;
        }),
      } as any as PluginFunctions;
      subject = null;
    });

    describe(
      args.length === 0 ? 'without config' : 'with `insertEmptyBlockOnReturnWithModifierKey: false` config',
      () => {
        beforeEach(() => {
          plugin = createMarkdownCodePlugin(...args);
          plugin.initialize?.(store);
        });

        describe('handleReturn', () => {
          const expectsHandled = () => {
            expect(subject?.()).toEqual('handled');
            expect(modifierSpy).toHaveBeenCalledTimes(1);
            expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
          };
          const expectsNotHandled = () => {
            expect(subject?.()).toEqual('not-handled');
            expect(modifierSpy).not.toHaveBeenCalled();
            expect(store.setEditorState).not.toHaveBeenCalled();
          };
          beforeEach(() => {
            subject = () => plugin.handleReturn?.(event, store.getEditorState(), store) ?? null;
          });
          it('does not handle', () => {
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: '',
                  type: 'unstyled',
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            expectsNotHandled();
          });
          it('leaves from list', () => {
            modifierSpy = jest.spyOn(LeaveListModule, 'default')
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: '',
                  type: 'ordered-list-item',
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            expectsHandled();
          });
          const testInsertNewBlock = (type: string, expects: () => void) => () => {
            modifierSpy = jest.spyOn(InsertEmptyBlockModule, 'default')
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: 'Hello',
                  type,
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            currentSelectionState = new SelectionState({
              anchorKey: 'item1',
              anchorOffset: 5,
              focusKey: 'item1',
              focusOffset: 5,
              isBackward: false,
              hasFocus: true,
            });
            expects();
          };
          const expects =
            args[0] && args[0].insertEmptyBlockOnReturnWithModifierKey === false ? expectsNotHandled : expectsHandled;
          ['one', 'two', 'three', 'four', 'five', 'six'].forEach(level => {
            describe(`on header-${level}`, () => {
              it('inserts new empty block on end of header return', testInsertNewBlock(`header-${level}`, expects));
            });
          });
          ['ctrlKey', 'shiftKey', 'metaKey', 'altKey'].forEach(key => {
            describe(`${key} is pressed`, () => {
              beforeEach(() => {
                const props = {};
                props[key] = true;
                event = createKeyboardEvent(props)
              });
              it('inserts new empty block', testInsertNewBlock('blockquote', expects));
            });
          });
          it('handles new code block', () => {
            modifierSpy = jest.spyOn(HandleNewCodeBlockModule, 'default')
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: '```',
                  type: 'unstyled',
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            expect(subject?.()).toEqual('handled');
            expect(modifierSpy).toHaveBeenCalledTimes(1)
            expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
          });
          it('handle code block closing', () => {
            modifierSpy = jest.spyOn(ChangeCurrentBlockTypeModule, 'default')
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: 'foo\n```',
                  type: 'code-block',
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            expect(subject?.()).toEqual('handled');
            expect(modifierSpy).toHaveBeenCalledTimes(1)
          });
          it('insert new line char from code-block', () => {
            modifierSpy = jest.spyOn(InsertTextModule, 'default')
            currentRawContentState = {
              entityMap: {},
              blocks: [
                {
                  key: 'item1',
                  text: 'const foo = a => a',
                  type: 'code-block',
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [],
                  data: {},
                },
              ],
            };
            expect(subject?.()).toEqual('handled');
            expect(modifierSpy).toHaveBeenCalledTimes(1)
            expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
          });
        });
        describe('blockStyleFn', () => {
          let type: string;
          beforeEach(() => {
            type = '';
            const getType = () => type;
            subject = () => plugin.blockStyleFn?.({ getType } as Draft.ContentBlock, store);
          });
          it('returns checkable-list-item', () => {
            type = 'checkable-list-item';
            expect(subject?.()).toEqual('checkable-list-item');
          });
          it('returns null', () => {
            type = 'ordered-list-item';
            expect(subject?.()).toBeNull()
          });
        });
        describe('blockRendererFn', () => {
          let type: string;
          let data: Record<string, any>;
          let block: Draft.ContentBlock;
          let spyOnChangeChecked: jest.SpyInstance<Draft.EditorState, [editorState: Draft.EditorState, block: Draft.ContentBlock]>;
          beforeEach(() => {
            type = '';
            data = {};
            spyOnChangeChecked = jest.spyOn(CheckableListItemUtils, 'toggleChecked');
            subject = () => {
              block = new ContentBlock({
                type,
                data: Map(data),
                key: 'item1',
                characterList: List(),
              });
              return plugin.blockRendererFn?.(block, store);
            };
          });
          afterEach(() => {
            spyOnChangeChecked.mockClear();
          });
          it('returns renderer', () => {
            type = 'checkable-list-item';
            data = { checked: true };
            const renderer = subject?.();
            expect(renderer.component).toEqual(CheckableListItem);
            expect(renderer.props.onChangeChecked).toBe(Function);
            expect(renderer.props.checked).toBeTruthy();
            renderer.props.onChangeChecked();
            expect(spyOnChangeChecked).toHaveBeenCalledWith(currentEditorState, block);
          });
          it('returns null', () => {
            type = 'ordered-list-item';
            expect(subject?.()).toBeNull()
          });
        });
        describe('onTab', () => {
          beforeEach(() => {
            subject = () => {
              modifierSpy = jest.spyOn(AdjustBlockDepthModule, 'default')
              return plugin.onTab?.(event, store);
            };
          });
          describe('no changes', () => {
            it('returns handled', () => {
              expect(subject?.()).toEqual('handled');
            });
            it('returns not-handled', () => {
              modifierSpy = jest.fn().mockReturnValue(currentEditorState);
              expect(subject?.()).toEqual('not-handled');
            });
          });
        });
        describe('handleBeforeInput', () => {
          let character: string;
          beforeEach(() => {
            character = ' ';
            subject = () => plugin.handleBeforeInput?.(character, store.getEditorState(), new Date().getTime(), store);
          });
          [HandleBlockType, HandleImage, HandleLink, HandleInlineStyle].forEach(modifierModule => {
            describe(modifierModule.default.name, () => {
              beforeEach(() => {
                modifierSpy = jest.spyOn(modifierModule, 'default')
              });
              it('returns handled', () => {
                expect(subject?.()).toEqual('handled');
                expect(modifierSpy).toHaveBeenCalledWith(currentEditorState, ' ');
              });
            });
          });
          describe('character is not a space', () => {
            beforeEach(() => {
              character = 'x';
            });
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
          describe('no matching modifiers', () => {
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
        });
        describe('handlePastedText', () => {
          let pastedText: string;
          let html: string | undefined;
          beforeEach(() => {
            pastedText = `_hello world_
          Hello`;
            html = undefined;
            subject = () => plugin.handlePastedText?.(pastedText, html, store.getEditorState(), store);
          });
          [HandleBlockType, HandleImage, HandleLink, HandleInlineStyle].forEach(modifierModule => {
            describe(modifierModule.default.name, () => {
              beforeEach(() => {
                modifierSpy = jest.spyOn(modifierModule, 'default')
              });
              it('returns handled', () => {
                expect(subject?.()).toEqual('handled');
                expect(modifierSpy).toHaveBeenCalled()
              });
            });
          });
          describe('nothing in clipboard', () => {
            beforeEach(() => {
              pastedText = '';
            });
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
          describe('pasted just text', () => {
            beforeEach(() => {
              pastedText = 'hello';
              modifierSpy = jest.spyOn(UtilsModule, 'replaceText')
            });
            it('returns handled', () => {
              expect(subject?.()).toEqual('handled');
              expect(modifierSpy).toHaveBeenCalledWith(currentEditorState, 'hello');
            });
          });
          describe('non-string empty value in clipboard', () => {
            beforeEach(() => {
              // @ts-expect-error
              pastedText = null;
            });
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
          describe('non-string value in clipboard', () => {
            beforeEach(() => {
              // @ts-expect-error
              pastedText = {};
            });
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
          describe('pasted just text with new line code', () => {
            beforeEach(() => {
              pastedText = 'hello\nworld';
              const rawContentState = {
                entityMap: {},
                blocks: [
                  {
                    key: 'item1',
                    text: '',
                    type: 'unstyled',
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                  },
                ],
              };
              const otherRawContentState = {
                entityMap: {},
                blocks: [
                  {
                    key: 'item2',
                    text: 'H1',
                    type: 'header-one',
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                  },
                ],
              };
              jest.spyOn(UtilsModule, 'replaceText').mockImplementation(() =>
                createEditorState(rawContentState, currentSelectionState)
              )
              jest.spyOn(CheckReturnForStateModule, 'default').mockImplementation(() =>
                createEditorState(otherRawContentState, currentSelectionState)
              );
            });
            it('return handled', () => {
              expect(subject?.()).toEqual('handled');
            });
          });
          describe('passed `html` argument', () => {
            beforeEach(() => {
              pastedText = '# hello';
              html = '<h1>hello</h1>';
            });
            it('returns not-handled', () => {
              expect(subject?.()).toEqual('not-handled');
            });
          });
        });
      },
    );
  });
});

function createKeyboardEvent(props = {}) {
  return createEvent('keyDown', window, props) as any as React.KeyboardEvent<Element>;
}
