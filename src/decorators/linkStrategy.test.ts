import Draft from 'draft-js';
import linkStrategy from './linkStrategy';

describe('linkStrategy', () => {
  const contentState = Draft.convertFromRaw({
    entityMap: {
      0: {
        type: 'LINK',
        mutability: 'MUTABLE',
        data: {
          href: 'http://cultofthepartyparrot.com/',
          title: 'parrot',
        },
      },
    },
    blocks: [
      {
        key: 'dtehj',
        text: 'parrot click me',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [
          {
            offset: 7,
            length: 5,
            key: 0,
          },
        ],
        data: {},
      },
    ],
  });
  it('callbacks range', () => {
    const block = contentState.getBlockForKey('dtehj');
    const cb = jest.fn()
    linkStrategy(block, cb, contentState);
    expect(cb).toHaveBeenCalledWith(7, 12);
  });
});
