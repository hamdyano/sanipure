// Gives existing accounts the admin or data entry role. Data entry can also be
// managed from the dashboard; admins can only be set with this script.
//
// Emails are matched whatever their capitals. Accounts that don't exist yet
// are reported and skipped: the person signs up first, then this is run again.
// Roles are never given to an email in advance, because anyone could sign up
// with it first (sign-up doesn't verify emails).
//
// Run from backend/ (nothing is written without --apply):
//   npx ts-node src/scripts/setRoles.ts --admin a@x.com,b@x.com --data-entry c@x.com [--apply]
// On the server, after building:
//   node dist/scripts/setRoles.js --admin … --data-entry … [--apply]

import { prisma } from "../prisma";

const args = process.argv.slice(2);

const emailsAfter = (flag: string): string[] => {
  const index = args.indexOf(flag);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (!value || value.startsWith("--")) return [];
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const main = async () => {
  const wanted = [
    ...emailsAfter("--admin").map((email) => ({ email, role: "admin" as const })),
    ...emailsAfter("--data-entry").map((email) => ({ email, role: "data_entry" as const })),
  ];
  if (!wanted.length) {
    throw new Error("Usage: setRoles --admin a@x.com,b@x.com --data-entry c@x.com [--apply]");
  }
  const lowered = wanted.map(({ email }) => email.toLowerCase());
  if (new Set(lowered).size !== lowered.length) throw new Error("An email is listed twice");

  const apply = args.includes("--apply");
  for (const { email, role } of wanted) {
    const matches = await prisma.user.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    const [user] = matches;
    if (!user) {
      console.log(`SKIPPED  ${email}: no account yet`);
    } else if (matches.length > 1) {
      console.log(`SKIPPED  ${email}: ${matches.length} accounts differ only by capitals`);
    } else if (user.role === role) {
      console.log(`OK       ${user.email}: already ${role}`);
    } else {
      if (apply) await prisma.user.update({ where: { id: user.id }, data: { role } });
      const since = user.createdAt.toISOString().slice(0, 10);
      console.log(
        `${apply ? "CHANGED " : "WOULD SET"} ${user.email}: ${user.role} -> ${role} (account since ${since})`
      );
    }
  }
  if (!apply) console.log("\nDry run: nothing written. Run again with --apply to save.");
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
