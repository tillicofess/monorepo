import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

export function defineAbilityFor(roles: string[]): MongoAbility {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (roles.includes('user')) {
    can('read', 'all');
    cannot('upload', 'largeFile');
  }

  if (roles.includes('admin')) {
    can('manage', 'all');
  }

  return build();
}
