import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'b2f'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '182'),
    exact: true
  },
  {
    path: '/blog/authors',
    component: ComponentCreator('/blog/authors', '0b7'),
    exact: true
  },
  {
    path: '/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/blog/authors/all-sebastien-lorber-articles', '4a1'),
    exact: true
  },
  {
    path: '/blog/authors/yangshun',
    component: ComponentCreator('/blog/authors/yangshun', 'a68'),
    exact: true
  },
  {
    path: '/blog/first-blog-post',
    component: ComponentCreator('/blog/first-blog-post', '89a'),
    exact: true
  },
  {
    path: '/blog/long-blog-post',
    component: ComponentCreator('/blog/long-blog-post', '9ad'),
    exact: true
  },
  {
    path: '/blog/mdx-blog-post',
    component: ComponentCreator('/blog/mdx-blog-post', 'e9f'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', '287'),
    exact: true
  },
  {
    path: '/blog/tags/docusaurus',
    component: ComponentCreator('/blog/tags/docusaurus', '704'),
    exact: true
  },
  {
    path: '/blog/tags/facebook',
    component: ComponentCreator('/blog/tags/facebook', '858'),
    exact: true
  },
  {
    path: '/blog/tags/hello',
    component: ComponentCreator('/blog/tags/hello', '299'),
    exact: true
  },
  {
    path: '/blog/tags/hola',
    component: ComponentCreator('/blog/tags/hola', '00d'),
    exact: true
  },
  {
    path: '/blog/welcome',
    component: ComponentCreator('/blog/welcome', 'd2b'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '464'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'b1d'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '2f9'),
            routes: [
              {
                path: '/docs/Architecture/Backend/Flask Scripts/academy',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/academy', 'e00'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/Flask Scripts/api',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/api', 'fb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/Flask Scripts/auth',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/auth', '17b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/Flask Scripts/check-password',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/check-password', '83f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/Flask Scripts/flag',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/flag', 'cc1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/Flask Scripts/server',
                component: ComponentCreator('/docs/Architecture/Backend/Flask Scripts/server', 'f17'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Backend/nginx',
                component: ComponentCreator('/docs/Architecture/Backend/nginx', '77f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Frontend',
                component: ComponentCreator('/docs/Architecture/Frontend', 'ae1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Architecture/Hosting',
                component: ComponentCreator('/docs/Architecture/Hosting', 'b4c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/architecture',
                component: ComponentCreator('/docs/category/architecture', '6d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/community',
                component: ComponentCreator('/docs/category/community', '5a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/gameplay',
                component: ComponentCreator('/docs/category/gameplay', 'f76'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Community/Contributiong',
                component: ComponentCreator('/docs/Community/Contributiong', '437'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Community/Socials',
                component: ComponentCreator('/docs/Community/Socials', '82b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Gameplay/aura-points',
                component: ComponentCreator('/docs/Gameplay/aura-points', 'ccf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Gameplay/certificate',
                component: ComponentCreator('/docs/Gameplay/certificate', '15f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Gameplay/getting-started',
                component: ComponentCreator('/docs/Gameplay/getting-started', 'b86'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Gameplay/next-level',
                component: ComponentCreator('/docs/Gameplay/next-level', '566'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/Platform/temp',
                component: ComponentCreator('/docs/Platform/temp', '803'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
