import type { MetadataRoute } from 'next';

const BASE_URL = 'https://catsafe.robertluo.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/plants`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
