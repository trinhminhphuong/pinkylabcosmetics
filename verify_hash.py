import bcrypt

# Hash currently stored in DB for admin@minhphuong.com
stored_hash = '$2a$10$9P2L8ftFJCcAigwxvxPLMe5pJliDzj6ntwZJv976/aK8oXNcEcJIm'
print('Stored hash:', stored_hash)
print('Length:', len(stored_hash))

# Try to verify
try:
    result = bcrypt.checkpw(b'Admin123@', stored_hash.encode())
    print('Matches Admin123@:', result)
except Exception as e:
    print('Error verifying:', e)

# Generate a fresh valid hash and verify immediately
fresh_hash_2b = bcrypt.hashpw(b'Admin123@', bcrypt.gensalt(10))
fresh_hash_2a = b'$2a$' + fresh_hash_2b[4:]
verify_fresh = bcrypt.checkpw(b'Admin123@', fresh_hash_2a)
print()
print('Fresh $2a$ hash:', fresh_hash_2a.decode())
print('Fresh hash verifies:', verify_fresh)
print('Hash length:', len(fresh_hash_2a))
