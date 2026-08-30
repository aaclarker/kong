import 'dotenv/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from './role.enum';

// Mints a non-expiring HS256 token for a role.
// Fixed demo credentials; no issuance endpoint.
// Usage: npm run mint-token <admin|user>

const arg = (process.argv[2] ?? '').toLowerCase();
const role = arg === 'admin' ? Role.Admin : arg === 'user' ? Role.User : null;

if (!role) {
  console.error('Usage: npm run mint-token <admin|user>');
  process.exit(1);
}

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not set (check your .env).');
  process.exit(1);
}

// No expiresIn: these tokens do not expire.
const jwt = new JwtService({ secret, signOptions: { algorithm: 'HS256' } });
console.log(jwt.sign({ sub: `${role}-demo`, role }));
