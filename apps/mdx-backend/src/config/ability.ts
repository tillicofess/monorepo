import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

export function defineAbilityFor(roles: string[]): MongoAbility {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  for (const role of roles) {
    const idx = role.indexOf(':')

    if (idx === -1) continue

    const subject = role.slice(0, idx)
    const action = role.slice(idx + 1)

    if (!subject || !action) continue

    can(action, subject)
  }

  return build()
}
