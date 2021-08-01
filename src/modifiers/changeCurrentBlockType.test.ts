import Draft, { EditorState, SelectionState } from 'draft-js';
import changeCurrentBlockType from './changeCurrentBlockType';

describe('changeCurrentBlockType', () => {
  const rawContentState = (text: string, type: Draft.DraftBlockType, data = {}) => ({
    entityMap: {},
    blocks: [
      {
        key: 'item1',
        text,
        type,
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data,
      },
    ],
  });
  const selectionState = new SelectionState({
    anchorKey: 'item1',
    anchorOffset: 0,
    focusKey: 'item1',
    focusOffset: 0,
    isBackward: false,
    hasFocus: true,
  });
  const createEditorState = (text: string, type: Draft.DraftBlockType, data = {}) => {
    const contentState = Draft.convertFromRaw(rawContentState(text, type, data));
    return EditorState.forceSelection(EditorState.createWithContent(contentState), selectionState);
  };
  it('changes block type', () => {
    const editorState = createEditorState('Yo', 'unstyled');
    const newEditorState = changeCurrentBlockType(editorState, 'header-one', 'Hello world', { foo: 'bar' });
    expect(newEditorState).not.toEqual(editorState);
    expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toMatchObject(
      rawContentState('Hello world', 'header-one', { foo: 'bar' }),
    );
  });
  it('changes block type even if data is null', () => {
    const editorState = createEditorState('Yo', 'unstyled');
    const newEditorState = changeCurrentBlockType(editorState, 'header-one', 'Hello world');
    expect(newEditorState).not.toEqual(editorState);
    expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toMatchObject(
      rawContentState('Hello world', 'header-one', {}),
    );
  });
});
