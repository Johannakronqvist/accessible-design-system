/*
  VisuallyHidden - text for assistive technology that no one sees.

  The canonical home for .ds-sr, which had drifted into being defined twice
  (Field.jsx and Link.jsx) with nothing keeping the two copies in step. Both now
  depend on this block instead.

  It is hidden with the clip technique rather than display:none, visibility:hidden
  or width:0 - all three of which remove the text from the accessibility tree,
  which is the opposite of the point. The element stays rendered, stays in the
  reading order, and stays announceable.

  Use it for the part of a label a sighted user gets from context:

    <button><Icon aria-hidden="true" /><VisuallyHidden>Delete invoice</VisuallyHidden></button>
    <span aria-hidden="true">*</span><VisuallyHidden> (required)</VisuallyHidden>
*/

export function VisuallyHidden({ as: Tag = "span", children, ...rest }) {
  return <Tag className="ds-sr" {...rest}>{children}</Tag>;
}

export const VISUALLYHIDDEN_CSS = `
.ds-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;border:0}
`;
