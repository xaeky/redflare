import type { Db } from 'mongodb';
import { AvatarBaseFlagsType } from '../../shared/enums/Commissions';

const FLAGS = AvatarBaseFlagsType;

export async function up(db: Db) {
  const collection = db.collection('avatar_bases');

  // If flags already exists, we will not modify it and remove the blacklisted field if it exists
  await collection.updateMany(
    { flags: { $exists: true }, blacklisted: { $exists: true } },
    [
      { $unset: ['blacklisted'] }
    ]
  );

  // Where { blacklisted: true }, set flags to FLAGS.Private and remove the blacklisted field
  await collection.updateMany(
    { blacklisted: true },
    [
      { $set: { flags: FLAGS.Private } },
      { $unset: ['blacklisted'] }
    ]
  );

  // Where { blacklisted: false }, set flags to 0 and remove the blacklisted field
  await collection.updateMany(
    { blacklisted: false, flags: { $exists: false } },
    [
      { $set: { flags: 0 } },
      { $unset: ['blacklisted'] }
    ]
  );
}

export async function down(db: Db) {
  const collection = db.collection('avatar_bases');

  // Where flags has FLAGS.Private, set blacklisted to true and remove the flags field
  await collection.updateMany(
    { flags: { $bitsAllSet: FLAGS.Private } },
    [
      { $set: { blacklisted: true } },
      { $unset: ['flags'] }
    ]
  );
  
  // Where flags does not have FLAGS.Private, set blacklisted to false and remove the flags field
  await collection.updateMany(
    { flags: { $bitsAllClear: FLAGS.Private } },
    [
      { $set: { blacklisted: false } },
      { $unset: ['flags'] }
    ]
  );

  // Rare case, if blacklisted already exists, we will not modify it, but we will remove the flags field if it exists
  await collection.updateMany(
    { blacklisted: { $exists: true }, flags: { $exists: true } },
    [
      { $unset: ['flags'] }
    ]
  );
}