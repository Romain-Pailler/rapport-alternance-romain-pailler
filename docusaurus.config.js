// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Rapport d'alternance",
  tagline: 'Dinosaurs are cool',
  favicon: 'img/logo.svg',

  // Set the production url of your site here
  url: 'https://rapport-alternance-romain-pailler.netlify.app/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'romain-pailler', // Usually your GitHub org/user name.
  projectName: 'rapport-alternance-romain-pailler', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
           // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  plugins: [
    [
    require.resolve("@easyops-cn/docusaurus-search-local"),
    ({
      hashed: true,
    }),
  ],],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: "Rapport d'alternance",
        logo: {
          alt: 'Logo Rapport',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/docs/category/présentation', label: 'Présentation', position: 'left'},
          {to: '/docs/category/missions', label: 'Missions', position: 'left'},
          {to: '/docs/category/annexes', label: 'Annexes', position: 'left'},
          {
            href: 'https://github.com/Romain-Pailler',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      mermaid: {
        theme: {light: 'neutral', dark: 'forest'},
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Présentation',
            items: [
              { label: "L'équipe", to: '/docs/presentation/Equipe' },
              { label: 'Le projet', to: '/docs/presentation/Leasa' }
            ]
          },
          {
            title: 'Projets',
            items: [
              {
                label: 'Page Recherche de demande',
                to: '/docs/missions/Projet_individuel/recherchedemande' 
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus'
              },
              { label: 'X', href: 'https://x.com/docusaurus' }
            ]
          },
          {
            title: 'Glossaire',
            items: [
              { label: 'Blog', to: '/blog' }, 
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
              }
            ]
          }
        ],
        copyright: "Copyright © 2025 Rapport d'alternance - Romain PAILLER"
      },
      
      prism: {
        additionalLanguages: ['java'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
