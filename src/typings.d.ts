/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

interface SvgrComponent
  extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export { svgComponent as ReactComponent }
}

declare module 'draft-js-checkable-list-item' {
  import { EditorState, ContentBlock } from 'draft-js'

  export const blockRenderMap: Immutable.Map<
    string,
    { element: string; wrapper: JSX.Element }
  >

  export const CheckableListItem: React.Component

  export abstract class CheckableListItemUtils {
    static toggleChecked(
      editorState: EditorState,
      block: ContentBlock
    ): EditorState

    static onTab(
      ev: React.KeyboardEvent<Element>,
      editorState: EditorState,
      maxDepth: number
    ): EditorState
  }

  export const CHECKABLE_LIST_ITEM: string
}
