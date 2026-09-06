import type { ComponentProps } from 'react';

// Vinext's production client navigation throws before following these links.
// Native navigation preserves the URL, history, keyboard, and new-tab behavior.
export default function SiteLink({ children, ...props }: ComponentProps<'a'>) {
  return <a {...props}>{children}</a>;
}
