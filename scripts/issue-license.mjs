import { issueLicense, isLicensePlan } from '../lib/license.ts';

const args = process.argv.slice(2);
const planFlag = args.find((part) => part.startsWith('--plan='))?.slice(7);
const planIndex = args.indexOf('--plan');
const plan = planFlag || (planIndex >= 0 ? args[planIndex + 1] : 'starter');
const daysFlag = args.find((part) => part.startsWith('--days='))?.slice(7);
const daysIndex = args.indexOf('--days');
const days = Number(daysFlag || (daysIndex >= 0 ? args[daysIndex + 1] : 35));
const secret = process.env.DAYMARK_LICENSE_SECRET;

if (!secret) {
  console.error('Set DAYMARK_LICENSE_SECRET before issuing a key.');
  process.exit(1);
}
if (!isLicensePlan(plan)) {
  console.error('Plan must be starter or operator.');
  process.exit(1);
}

const issued = await issueLicense(secret, plan, {
  validDays: Number.isFinite(days) ? days : 35,
});
console.log(JSON.stringify(issued, null, 2));
