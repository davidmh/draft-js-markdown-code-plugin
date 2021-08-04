import Draft from 'draft-js';
import imageStrategy from './imageStrategy';

describe('imageStrategy', () => {
  const contentState = Draft.convertFromRaw({
    entityMap: {
      0: {
        type: 'IMG',
        mutability: 'IMMUTABLE',
        data: {
          alt: 'alt',
          src: 'http://cultofthepartyparrot.com/parrots/aussieparrot.gif',
          title: 'parrot',
        },
      },
    },
    blocks: [
      {
        key: 'dtehj',
        text: ' ',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [
          {
            offset: 0,
            length: 1,
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
    imageStrategy(block, cb, contentState);
    expect(cb).toHaveBeenCalledWith(0, 1);
  });
});
