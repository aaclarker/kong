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

      for (const s of SERVICES) {
        const service = manager.create(Service, {
          name: s.name,
          description: s.description,
          versions: s.versions.map((v) => manager.create(Version, v)),
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
