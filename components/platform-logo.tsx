import { ReceiptText } from 'lucide-react';
import Image from 'next/image';

const platforms: Record<string, { file: string; label: string }> = {
  Meta: { file: 'meta.svg', label: 'Meta' },
  Google: { file: 'google-ads.svg', label: 'Google Ads' },
  Analytics: { file: 'google-analytics.svg', label: 'Google Analytics' },
  Shopify: { file: 'shopify.svg', label: 'Shopify' },
  Stripe: { file: 'stripe.svg', label: 'Stripe' },
};

export default function PlatformLogo({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  const platform = platforms[name];
  return (
    <span
      className={`platform-icon platform-${name.toLowerCase()} ${className}`}
    >
      {platform ? (
        <Image
          src={`/brands/${platform.file}`}
          alt={platform.label}
          width={32}
          height={32}
          unoptimized
        />
      ) : (
        <ReceiptText size={22} aria-label="Sales records" />
      )}
    </span>
  );
}
