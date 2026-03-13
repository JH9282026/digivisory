export function generateJsonLd(data: {
  type: string;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
  authorJobTitle?: string;
  authorSameAs?: string[];
  publisherName?: string;
  publisherLogo?: string;
  wordCount?: number;
  keywords?: string[];
  breadcrumbs?: { name: string; url: string }[];
  faqItems?: { question: string; answer: string }[];
}) {
  const schemas: Record<string, unknown>[] = [];

  if (data.type === 'BlogPosting' || data.type === 'Article') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': data.type,
      mainEntityOfPage: { '@type': 'WebPage', '@id': data.url ?? '' },
      headline: data.title ?? '',
      description: data.description ?? '',
      image: data.image ?? '',
      author: {
        '@type': 'Person',
        name: data.authorName ?? '',
        url: data.authorUrl ?? '',
        jobTitle: data.authorJobTitle ?? '',
        sameAs: data.authorSameAs ?? [],
      },
      publisher: {
        '@type': 'Organization',
        name: data.publisherName ?? '',
        logo: data.publisherLogo ? { '@type': 'ImageObject', url: data.publisherLogo } : undefined,
      },
      datePublished: data.datePublished ?? '',
      dateModified: data.dateModified ?? '',
      wordCount: data.wordCount ?? 0,
      keywords: data.keywords ?? [],
    });
  }

  if (data.type === 'WebPage') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title ?? '',
      description: data.description ?? '',
      url: data.url ?? '',
      datePublished: data.datePublished ?? '',
      dateModified: data.dateModified ?? '',
    });
  }

  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data.breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (data.faqItems && data.faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqItems.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return schemas;
}
