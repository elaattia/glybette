# Glossary

## Account

Platform identity record authenticated through Users Service.

## Student

Canonical base role (`baseRole=student`) for regular users with access to student-facing product features.

## Enterprise

Canonical base role (`baseRole=enterprise`) for enterprise accounts. In current MVP this role is routed to an enterprise placeholder dashboard only.

## Admin

Privilege elevation (`isAdmin=true`) on top of a base role. Admin users can access platform management routes and perform moderation operations.

## Banned

Account status (`accountStatus=banned`) that blocks protected access and revokes active sessions immediately.

## Verified

Email verification state where the account has completed OTP/email verification and can access protected product routes.
