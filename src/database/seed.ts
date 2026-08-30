import { AppDataSource } from './data-source';
import { Service } from '../services/entities/service.entity';
import { Version } from '../versions/entities/version.entity';

type Seed = {
  name: string;
  description: string;
  versions: { version: string; changelog: string; description?: string }[];
};

const SERVICES: Seed[] = [
  {
    name: 'Billing API',
    description: 'Handles invoices, payments, and subscription charges.',
    versions: [
      { version: '1.0.0', changelog: 'Initial release.' },
      { version: '1.1.0', changelog: 'Add proration on plan changes.' },
    ],
  },
  {
    name: 'Auth Service',
    description: 'Issues and validates access tokens for all clients.',
    versions: [{ version: '2.3.1', changelog: 'Rotate signing keys.' }],
  },
  {
    name: 'Search Service',
    description: 'Full-text search over the product catalog.',
    versions: [
      { version: '0.9.0', changelog: 'Beta: basic keyword search.' },
      { version: '1.0.0', changelog: 'GA: ranking and typo tolerance.' },
    ],
  },
];

async function seed(): Promise<void> {
  const ds = await AppDataSource.initialize();
  try {
    await ds.transaction(async (manager) => {
      // Idempotent: clear existing rows (versions cascade from services).
      await manager.query('TRUNCATE TABLE "services" CASCADE');

      // Stagger timestamps so createdAt ordering is deterministic (a single
      // transaction's now() would give every row the same value).
      const DAY = 24 * 60 * 60 * 1000;
      const HOUR = 60 * 60 * 1000;
      const base = new Date('2024-01-01T00:00:00Z').getTime();

      for (let i = 0; i < SERVICES.length; i++) {
        const s = SERVICES[i];
        const created = new Date(base + i * DAY);
        const service = manager.create(Service, {
          name: s.name,
          description: s.description,
          createdAt: created,
          updatedAt: created,
          versions: s.versions.map((v, j) => {
            const vCreated = new Date(created.getTime() + j * HOUR);
            return manager.create(Version, {
              ...v,
              createdAt: vCreated,
              updatedAt: vCreated,
            });
          }),
        });
        await manager.save(service); // cascade:['insert'] persists versions
      }
    });

    const services = await ds.getRepository(Service).count();
    const versions = await ds.getRepository(Version).count();
    console.log(`Seeded ${services} services, ${versions} versions.`);
  } finally {
    await ds.destroy();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
