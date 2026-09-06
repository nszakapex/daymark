'use client';
import Link from '@/components/site-link';
import { useState } from 'react';
import {
  ArrowRight,
  CheckCheck,
  LoaderCircle,
  Info,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { goalOptions, toolOptions, type SavedProfile } from '@/lib/profile';

export default function ProfileForm({
  initialProfile,
  email,
  unavailable,
}: {
  initialProfile: SavedProfile | null;
  email: string;
  unavailable: boolean;
}) {
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [website, setWebsite] = useState(initialProfile?.website ?? '');
  const [goal, setGoal] = useState(initialProfile?.goal ?? 'customer-cost');
  const [selectedTools, setSelectedTools] = useState(
    initialProfile?.tools ?? [],
  );
  const [contactAllowed, setContactAllowed] = useState(
    initialProfile?.contactAllowed ?? false,
  );
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(!!initialProfile);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(
    unavailable
      ? 'Your saved details could not be loaded. Refresh before editing.'
      : '',
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      const result = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website,
          goal,
          tools: selectedTools,
          contactAllowed,
        }),
      });
      const data = (await result.json()) as {
        error?: string;
        profile?: SavedProfile;
      };
      if (!result.ok)
        throw Error(data.error || 'Your profile could not be saved.');
      if (!data.profile)
        throw Error(
          'The saved profile could not be confirmed. Please refresh.',
        );
      setWebsite(data.profile.website);
      setSaved(true);
      setMessage(
        'Your pilot profile is saved. Live marketing accounts are not connected yet.',
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPending(false);
    }
  }
  async function removeProfile() {
    setPending(true);
    setError('');
    setMessage('');
    try {
      const result = await fetch('/api/workspace', { method: 'DELETE' });
      const data = (await result.json()) as { error?: string };
      if (!result.ok)
        throw Error(data.error || 'Your profile could not be removed.');
      setName('');
      setWebsite('');
      setGoal('customer-cost');
      setSelectedTools([]);
      setContactAllowed(false);
      setSaved(false);
      setConfirmDelete(false);
      setMessage('Your saved business profile has been removed.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="profile-form" onSubmit={submit}>
      <h2>{saved ? 'Your business, in focus.' : 'Make yourself at home.'}</h2>
      <p>About a minute to set up. No payment details needed.</p>
      <div className="field-group">
        <label htmlFor="business-name">Business name</label>
        <Input
          id="business-name"
          type="text"
          autoComplete="organization"
          placeholder="Your business name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={100}
          required
          disabled={pending || unavailable}
        />
      </div>
      <div className="field-group">
        <label htmlFor="website">
          Website <span>optional</span>
        </label>
        <Input
          id="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourbusiness.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          maxLength={250}
          disabled={pending || unavailable}
        />
      </div>
      <div className="field-group">
        <label id="goal-label" htmlFor="goal">
          What would you like to understand first?
        </label>
        <Select
          value={goal}
          onValueChange={(v) => {
            if (v) setGoal(v);
          }}
          disabled={pending || unavailable}
        >
          <SelectTrigger
            className="period-select"
            id="goal"
            aria-labelledby="goal-label"
          >
            <SelectValue>
              {goalOptions.find((option) => option.value === goal)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {goalOptions.map((g) => (
              <SelectItem value={g.value} key={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <fieldset className="field-group" disabled={pending || unavailable}>
        <legend>Which tools do you use?</legend>
        <div className="tool-choices">
          {toolOptions.map((tool) => (
            <label
              className="tool-choice"
              key={tool}
              htmlFor={'tool-' + tool.replaceAll(' ', '-')}
            >
              <Checkbox
                id={'tool-' + tool.replaceAll(' ', '-')}
                checked={selectedTools.includes(tool)}
                onCheckedChange={(checked) =>
                  setSelectedTools((prev) =>
                    checked ? [...prev, tool] : prev.filter((t) => t !== tool),
                  )
                }
              />
              {tool}
            </label>
          ))}
        </div>
        <p className="field-hint">
          This helps us plan connections. Selecting a tool does not connect it.
        </p>
      </fieldset>
      <div className="field-group">
        <label className="contact-choice" htmlFor="contact-allowed">
          <Checkbox
            id="contact-allowed"
            checked={contactAllowed}
            onCheckedChange={(checked) => setContactAllowed(checked === true)}
            disabled={pending || unavailable}
          />
          <span>
            You can email me about a Daymark pilot at <strong>{email}</strong>.
          </span>
        </label>
      </div>
      <Button
        className="form-submit"
        type="submit"
        disabled={pending || unavailable}
      >
        {pending ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}{' '}
        {pending ? 'Saving…' : saved ? 'Save changes' : 'Save my pilot profile'}
      </Button>
      {message && (
        <output className="form-result form-success" aria-live="polite">
          <CheckCheck size={17} />
          <span>{message}</span>
        </output>
      )}
      {error && (
        <div className="form-result form-error" role="alert">
          <Info size={17} />
          <span>{error}</span>
        </div>
      )}
      <p className="saved-meta">
        Your details are stored with your signed-in account. No marketing data
        is imported. <Link href="/privacy">How your data is handled →</Link>
      </p>
      {saved && (
        <div className="profile-delete">
          {confirmDelete ? (
            <>
              <p>
                This removes your saved business details and pilot contact
                preference.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={removeProfile}
              >
                Delete my profile
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirmDelete(false)}
              >
                Keep profile
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={pending}
            >
              <Trash2 size={12} /> Remove saved profile
            </button>
          )}
        </div>
      )}
    </form>
  );
}
