'use client';
import Link from '@/components/site-link';
import { useEffect, useRef, useState } from 'react';
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
  const [lastSaved, setLastSaved] = useState(initialProfile);
  const [editing, setEditing] = useState(!initialProfile);
  const [operation, setOperation] = useState<'save' | 'delete' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(
    unavailable
      ? 'Your saved details could not be loaded. Refresh before editing.'
      : '',
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const deleteQuestionRef = useRef<HTMLParagraphElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const deleteWasOpen = useRef(false);
  useEffect(() => {
    if (confirmDelete) deleteQuestionRef.current?.focus();
    else if (deleteWasOpen.current) deleteButtonRef.current?.focus();
    deleteWasOpen.current = confirmDelete;
  }, [confirmDelete]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [editing, saved]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setOperation('save');
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
      setName(data.profile.name);
      setWebsite(data.profile.website);
      setLastSaved(data.profile);
      setEditing(false);
      setSaved(true);
      setMessage('Your business details are saved.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPending(false);
      setOperation(null);
    }
  }
  async function removeProfile() {
    setPending(true);
    setOperation('delete');
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
      setLastSaved(null);
      setEditing(true);
      setConfirmDelete(false);
      setMessage('Your saved business profile has been removed.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPending(false);
      setOperation(null);
    }
  }
  function cancelEdit() {
    if (!lastSaved) return;
    setName(lastSaved.name);
    setWebsite(lastSaved.website);
    setGoal(lastSaved.goal);
    setSelectedTools(lastSaved.tools);
    setContactAllowed(lastSaved.contactAllowed);
    setEditing(false);
    setError('');
  }
  return (
    <form className="profile-form" onSubmit={submit} aria-busy={pending}>
      {saved && !editing && lastSaved ? (
        <div className="profile-confirmation">
          <span className="confirmation-icon">
            <CheckCheck size={27} />
          </span>
          <h2 ref={headingRef} tabIndex={-1}>
            Your details are saved.
          </h2>
          <p>
            You can return here to update your business details and email
            preference.
          </p>
          <dl className="profile-summary">
            <div>
              <dt>Business</dt>
              <dd>{lastSaved.name}</dd>
            </div>
            {lastSaved.website && (
              <div>
                <dt>Website</dt>
                <dd>{lastSaved.website}</dd>
              </div>
            )}
            <div>
              <dt>What you want to understand</dt>
              <dd>
                {
                  goalOptions.find((option) => option.value === lastSaved.goal)
                    ?.label
                }
              </dd>
            </div>
            <div>
              <dt>Tools you use</dt>
              <dd>
                {lastSaved.tools.length
                  ? lastSaved.tools
                      .map((tool) =>
                        tool === 'A CRM'
                          ? 'Customer management software (CRM)'
                          : tool,
                      )
                      .join(', ')
                  : 'None selected yet'}
              </dd>
            </div>
          </dl>
          <div className="profile-next-step">
            <h3>What happens next?</h3>
            <p>
              Live marketing connections are still being built, so your business
              does not have a report yet. You can explore the sample report and
              try its review checklist now.
            </p>
            <p>
              {lastSaved.contactAllowed ? (
                <>
                  You have allowed Daymark to email you about early access at{' '}
                  <strong>{email}</strong>.
                </>
              ) : (
                'Email updates are off. You can turn them on by editing your details.'
              )}
            </p>
          </div>
          <Link href="/demo" className="button-primary">
            Explore sample report <ArrowRight size={17} />
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditing(true);
              setMessage('');
            }}
          >
            Edit my details
          </Button>
        </div>
      ) : (
        <>
          <h2 ref={headingRef} tabIndex={-1}>
            {saved ? 'Edit your business details' : 'Your business details'}
          </h2>
          <p>
            Save your preferences for early access. This does not connect your
            marketing accounts.
          </p>
          {unavailable && (
            <Link className="text-link" href="/workspace">
              Try loading your details again <ArrowRight size={16} />
            </Link>
          )}
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
              aria-invalid={
                error.toLowerCase().includes('website') || undefined
              }
              aria-describedby={
                error.toLowerCase().includes('website')
                  ? 'profile-error'
                  : undefined
              }
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
            <legend>
              Which tools do you use?{' '}
              <span className="field-optional">Optional</span>
            </legend>
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
                    disabled={pending || unavailable}
                    onCheckedChange={(checked) =>
                      setSelectedTools((prev) =>
                        checked
                          ? [...prev, tool]
                          : prev.filter((t) => t !== tool),
                      )
                    }
                  />
                  {tool === 'A CRM'
                    ? 'Customer management software (CRM)'
                    : tool}
                </label>
              ))}
            </div>
            <p className="field-hint">
              Select all that apply, or leave this blank if you are not sure.
            </p>
          </fieldset>
          <div className="field-group">
            <label className="contact-choice" htmlFor="contact-allowed">
              <Checkbox
                id="contact-allowed"
                checked={contactAllowed}
                onCheckedChange={(checked) =>
                  setContactAllowed(checked === true)
                }
                disabled={pending || unavailable}
              />
              <span>
                Email me about early access at <strong>{email}</strong>. This is
                optional.
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
            {pending ? 'Saving…' : saved ? 'Save changes' : 'Save my details'}
          </Button>
          {saved && (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={cancelEdit}
            >
              Cancel changes
            </Button>
          )}
        </>
      )}
      {message && (!saved || editing) && (
        <output className="form-result form-success" aria-live="polite">
          <CheckCheck size={17} />
          <span>{message}</span>
        </output>
      )}
      {error && (
        <div
          className="form-result form-error"
          role="alert"
          id="profile-error"
          ref={errorRef}
          tabIndex={-1}
        >
          <Info size={17} />
          <span>{error}</span>
        </div>
      )}
      <p className="saved-meta">
        {saved
          ? 'Your details are saved to your account.'
          : 'Your details are only saved when you select Save my details.'}{' '}
        <Link href="/privacy">How your data is handled →</Link>
      </p>
      {saved && (
        <div className="profile-delete">
          {confirmDelete ? (
            <>
              <p ref={deleteQuestionRef} tabIndex={-1}>
                Delete your saved business details and email preference? Your
                ChatGPT account will stay active.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={removeProfile}
              >
                {operation === 'delete' ? 'Deleting…' : 'Delete my details'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirmDelete(false)}
              >
                Keep my details
              </Button>
            </>
          ) : (
            <button
              ref={deleteButtonRef}
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={pending}
            >
              <Trash2 size={15} /> Delete saved details
            </button>
          )}
        </div>
      )}
    </form>
  );
}
