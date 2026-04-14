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
      components: {
        ThemeSelect: './src/components/ThemeSelectWithOPCO.astro',
      },
      sidebar: [
        { label: 'Overview', slug: 'overview' },
        { label: 'System Registry', slug: 'system-registry' },
        { label: 'Subsidiary Documentation Portal', slug: 'opco-directory' },
        {
          label: 'Architecture',
          items: [
            { slug: 'architecture/azure-infrastructure' },
            { slug: 'architecture/hub-services' },
            { slug: 'architecture/spoke-architecture' },
            { slug: 'architecture/network-security' },
            { slug: 'architecture/deployment-guide' },
            { slug: 'architecture/enterprise-summary' },
            { slug: 'architecture/integration-overview' },
            { slug: 'architecture/integration-patterns' },
            { slug: 'architecture/data-flows' },
            { slug: 'architecture/analytics-platform' },
            { slug: 'architecture/technology-radar' },
            { slug: 'architecture/modernization-roadmap' },
          ],
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
