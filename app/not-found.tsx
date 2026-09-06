import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Brand } from './landing';

export default function NotFound() {
  return (
    <main className="privacy-page">
      <Brand />
      <h1>Let’s bring things back into focus.</h1>
      <p>
        We couldn’t find that page. Your Daymark brief is a good place to start.
      </p>
      <Link className="text-link" href="/demo">
        Explore the sample workspace <ArrowRight size={16} />
      </Link>
    </main>
  );
}
