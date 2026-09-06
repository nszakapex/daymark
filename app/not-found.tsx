import Link from '@/components/site-link';
import { ArrowRight } from 'lucide-react';
import { Brand } from './landing';

export default function NotFound() {
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>We couldn’t find that page.</h1>
      <p>
        The address may have changed. You can return to the sample report below.
      </p>
      <Link className="text-link" href="/demo">
        Explore sample report <ArrowRight size={16} />
      </Link>
    </main>
  );
}
