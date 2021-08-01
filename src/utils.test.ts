import Draft, { EditorState, SelectionState } from 'draft-js';
import insertEmptyBlock from './modifiers/insertEmptyBlock';
import { addText, replaceText } from './utils';

describe('utils test', () => {
  const newRawContentState = {
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

  it('should addText', () => {
    let newEditorState = EditorState.createWithContent(Draft.convertFromRaw(newRawContentState));
    const randomText = Date.now().toString(32);
    newEditorState = insertEmptyBlock(newEditorState);
    newEditorState = addText(newEditorState, randomText);
    const currentContent = newEditorState.getCurrentContent();
    expect(currentContent.hasText()).toBeTruthy();
    const lastBlock = currentContent.getLastBlock();
    expect(lastBlock.getText()).toEqual(randomText);
  });

  it('should replaceText', () => {
    let newEditorState = EditorState.createWithContent(Draft.convertFromRaw(newRawContentState));
    const randomText = Date.now().toString(32);
    let currentContent = newEditorState.getCurrentContent();
    let lastBlock = currentContent.getLastBlock();
    const newSelection = new SelectionState({
      anchorKey: lastBlock.getKey(),
      anchorOffset: 0,
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getText().length,
    });
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    newEditorState = replaceText(newEditorState, randomText);
    currentContent = newEditorState.getCurrentContent();
    expect(currentContent.hasText()).toBeTruthy()
    lastBlock = currentContent.getLastBlock();
    expect(lastBlock.getText()).toEqual(randomText);
    const firstBlock = currentContent.getFirstBlock();
    expect(firstBlock.getText()).toEqual(randomText);
  });
});
