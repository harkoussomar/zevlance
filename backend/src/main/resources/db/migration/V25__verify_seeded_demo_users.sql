UPDATE users
SET email_verified = TRUE
WHERE email IN (
    'alice@example.com',
    'bob@example.com',
    'admin@example.com',
    'david@example.com',
    'eve@example.com',
    'frank@example.com',
    'grace@example.com',
    'hector@example.com',
    'ivy@example.com',
    'jack@example.com',
    'lara@example.com',
    'mike@example.com'
);
