# Security Specification for Swasthya Delhi

## Data Invariants
1. A Health Record must belong to the authenticated user and have a valid date.
2. An Appointment must have a standard status and a future or current date on creation.
3. User Profiles must be private - only the user can read/write their own PII (health summary, email, age).
4. Public data like hospitals and offers are read-only for users.

## The Dirty Dozen Payloads (Targeting Rejection)
1. Write to another user's profile.
2. Edit an appointment's status to 'completed' as a normal user (if we had hospital admin logic).
3. Inject a 2MB string into a health record note.
4. Create a chat session for a different user ID.
5. Update `ownerId` of a health record after creation.
6. Delete a hospital record as an unauthenticated user.
7. Create a health record with a future timestamp spoofed as current.
8. Read all user profiles in one query.
9. Inject special characters into document IDs.
10. Update the `email` of a user profile without matching the auth token.
11. Create an offer with a 1000% discount.
12. Fetch PII data of another user via list query.

## Test Runner (Draft)
The tests will verify that `request.auth.uid` is strictly enforced for all user-specific collections.
`isValidUserProfile`, `isValidHealthRecord`, etc. will be used.
