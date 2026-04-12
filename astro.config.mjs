import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://epam-acme-corp.github.io',
  base: '/corporate-docs',
  integrations: [
    starlight({
      title: 'Acme Corporation',
      description: 'Corporate Knowledge Base',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/epam-acme-corp' },
      ],
      sidebar: [
        { label: 'Overview', slug: 'overview' },
        { label: 'System Registry', slug: 'system-registry' },
        {
          label: 'Architecture',
          autogenerate: { directory: 'architecture' },
        },
        {
          label: 'API Contracts',
          autogenerate: { directory: 'api' },
        },
        {
          label: 'Governance',
          autogenerate: { directory: 'governance' },
        },
        {
          label: 'Glossary',
          autogenerate: { directory: 'glossary' },
        },
        {
          label: 'Templates',
          autogenerate: { directory: 'governance/templates' },
        },
      ],
    }),
  ],
});
