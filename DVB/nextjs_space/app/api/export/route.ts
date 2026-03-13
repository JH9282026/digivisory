export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') ?? 'posts';
    const format = searchParams.get('format') ?? 'json';

    if (type === 'posts') {
      const posts = await prisma.post.findMany({
        include: { author: { select: { name: true, email: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
        orderBy: { createdAt: 'desc' },
      });
      if (format === 'xml') {
        const xml = generateWPXml(posts.map(p => ({
          title: p?.title ?? '', content: p?.content ?? '', excerpt: p?.excerpt ?? '',
          slug: p?.slug ?? '', status: p?.status ?? 'draft', publishedAt: p?.publishedAt?.toISOString?.() ?? '',
          author: p?.author?.name ?? '', categories: p?.categories?.map(c => c?.category?.name ?? '') ?? [],
          tags: p?.tags?.map(t => t?.tag?.name ?? '') ?? [], type: 'post',
        })));
        return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml', 'Content-Disposition': 'attachment; filename=posts-export.xml' } });
      }
      return NextResponse.json(posts);
    }

    if (type === 'pages') {
      const pages = await prisma.page.findMany({
        include: { author: { select: { name: true, email: true } } },
        orderBy: { sortOrder: 'asc' },
      });
      if (format === 'xml') {
        const xml = generateWPXml(pages.map(p => ({
          title: p?.title ?? '', content: p?.content ?? '', excerpt: '',
          slug: p?.slug ?? '', status: p?.status ?? 'draft', publishedAt: p?.publishedAt?.toISOString?.() ?? '',
          author: p?.author?.name ?? '', categories: [], tags: [], type: 'page',
        })));
        return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml', 'Content-Disposition': 'attachment; filename=pages-export.xml' } });
      }
      return NextResponse.json(pages);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}

function generateWPXml(items: { title: string; content: string; excerpt: string; slug: string; status: string; publishedAt: string; author: string; categories: string[]; tags: string[]; type: string }[]) {
  const itemsXml = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.slug}</link>
      <wp:post_type>${item.type}</wp:post_type>
      <wp:status>${item.status === 'published' ? 'publish' : item.status}</wp:status>
      <wp:post_name>${item.slug}</wp:post_name>
      <dc:creator>${item.author}</dc:creator>
      <pubDate>${item.publishedAt}</pubDate>
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
      <excerpt:encoded><![CDATA[${item.excerpt}]]></excerpt:encoded>
      ${item.categories.map(c => `<category domain="category"><![CDATA[${c}]]></category>`).join('\n      ')}
      ${item.tags.map(t => `<category domain="post_tag"><![CDATA[${t}]]></category>`).join('\n      ')}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>DVB Export</title>
    <wp:wxr_version>1.2</wp:wxr_version>
    ${itemsXml}
  </channel>
</rss>`;
}
