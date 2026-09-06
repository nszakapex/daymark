export const toolOptions = [
  'Meta Ads',
  'Google Ads',
  'Shopify',
  'Stripe',
  'Google Analytics',
  'A CRM',
  'Other',
] as const;
export const goalOptions = [
  { value: 'customer-cost', label: 'Understand what a new customer costs' },
  { value: 'working-channels', label: 'See which channels deserve attention' },
  { value: 'reliable-data', label: 'Make my marketing numbers more reliable' },
] as const;
export type ProfileInput = {
  name: string;
  website: string;
  goal: string;
  tools: string[];
  contactAllowed: boolean;
};
export type SavedProfile = ProfileInput & { updatedAt: string };

export function validateProfile(value: unknown): ProfileInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Please provide your business details.');
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== 'string' ||
    input.name.trim().length < 2 ||
    input.name.trim().length > 100
  )
    throw Error('Use a business name between 2 and 100 characters.');
  if (typeof input.website !== 'string' || input.website.length > 250)
    throw Error('Please enter a valid website, or leave it blank.');
  let website = input.website.trim();
  if (website) {
    if (!website.includes('://')) website = 'https://' + website;
    let url: URL;
    try {
      url = new URL(website);
    } catch {
      throw Error('Please enter a valid website address.');
    }
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      !url.hostname.includes('.') ||
      url.username ||
      url.password
    )
      throw Error(
        'Please enter a public website address without login details.',
      );
    website = url.href;
  }
  if (
    typeof input.goal !== 'string' ||
    !goalOptions.some((g) => g.value === input.goal)
  )
    throw Error('Choose what you want to understand first.');
  if (
    !Array.isArray(input.tools) ||
    input.tools.length > toolOptions.length ||
    !input.tools.every(
      (t) =>
        typeof t === 'string' &&
        toolOptions.includes(t as (typeof toolOptions)[number]),
    )
  )
    throw Error('Choose from the listed marketing tools.');
  if (typeof input.contactAllowed !== 'boolean')
    throw Error('Please choose your contact preference.');
  return {
    name: input.name.trim(),
    website,
    goal: input.goal,
    tools: [...new Set(input.tools)] as string[],
    contactAllowed: input.contactAllowed,
  };
}
