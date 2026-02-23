import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

export function defineAbilityFor(roles: string[]): MongoAbility {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (roles.includes('role_user')) {
    can('read', 'all');
    cannot('upload', 'largeFile');
  }

  if (roles.includes('role_admin')) {
    can('manage', 'all');
  }

  return build();
}
