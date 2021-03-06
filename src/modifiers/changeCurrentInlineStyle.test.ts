import Draft, { EditorState, SelectionState } from 'draft-js';
import changeCurrentInlineStyle from './changeCurrentInlineStyle';

describe('changeCurrentInlineStyle', () => {
  const rawContentState = (
    text: string,
    inlineStyleRanges: Draft.RawDraftInlineStyleRange[]
  ): Draft.RawDraftContentState => ({
    entityMap: {},
    blocks: [
      {
        key: 'item1',
        text,
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges,
        entityRanges: [],
        data: {},
      },
    ],
  });

  const selectionState = new SelectionState({
    anchorKey: 'item1',
    anchorOffset: 5,
    focusKey: 'item1',
    focusOffset: 5,
    isBackward: false,
    hasFocus: true,
  });
  const createEditorState = (
    text: string,
    inlineStyleRanges: Draft.RawDraftInlineStyleRange[]
  ) => {
    const contentState = Draft.convertFromRaw(rawContentState(text, inlineStyleRanges));
    return EditorState.forceSelection(EditorState.createWithContent(contentState), selectionState);
  };
  it('changes block type', () => {
    const text = 'foo `bar` baz';
    const editorState = createEditorState(text, []);
    const matchArr: RegExpMatchArray = ['`bar` ', '`', 'bar', '`', ' '];
    matchArr.index = 4;
    matchArr.input = text;
    const newEditorState = changeCurrentInlineStyle(editorState, matchArr, 'CODE');
    expect(newEditorState).not.toEqual(editorState);
    expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toMatchObject(
      rawContentState(
        'foo bar baz',
        [
          {
            length: 3,
            offset: 4,
            style: 'CODE',
          },
        ],
      ),
    );
  });
});
