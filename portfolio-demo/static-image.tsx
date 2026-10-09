import type { ComponentProps } from 'react';

// Sample brand marks are local SVGs; this target needs no image server.
export default function StaticImage({
  unoptimized: _unoptimized,
  alt,
  ...props
}: ComponentProps<'img'> & { unoptimized?: boolean }) {
  // Local fixed-size SVG marks do not need a framework image service.
  // oxlint-disable-next-line next/no-img-element
  return <img {...props} alt={alt} />;
}
