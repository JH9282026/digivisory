import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { password: hashedPassword },
    create: {
      email: 'john@doe.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      bio: 'Site administrator and content creator.',
      expertise: 'Web Development & SEO',
    },
  });
  console.log('Admin user upserted:', admin.email);

  // 2. Categories
  const categoryData = [
    { name: 'Technology', slug: 'technology', description: 'Latest in tech, software, and innovation.' },
    { name: 'Marketing', slug: 'marketing', description: 'Digital marketing tips and strategies.' },
    { name: 'SEO', slug: 'seo', description: 'Search engine optimization guides and news.' },
    { name: 'Design', slug: 'design', description: 'UI/UX design trends and inspiration.' },
  ];
  for (const cat of categoryData) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: { name: cat.name, description: cat.description }, create: cat });
  }
  console.log('Categories seeded.');

  // 3. Tags
  const tagData = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'SEO Tips', slug: 'seo-tips' },
    { name: 'Content Strategy', slug: 'content-strategy' },
    { name: 'AI', slug: 'ai' },
  ];
  for (const tag of tagData) {
    await prisma.tag.upsert({ where: { slug: tag.slug }, update: { name: tag.name }, create: tag });
  }
  console.log('Tags seeded.');

  // 4. Site Settings (single-row model)
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: 'DVB Blog',
        tagline: 'Insights on Technology, SEO & Digital Marketing',
        siteUrl: '',
        defaultMetaDesc: 'DVB Blog covers the latest in technology, SEO, digital marketing, and web development.',
        colorScheme: 'indigo',
      },
    });
  }
  console.log('Settings seeded.');

  // 5. Menus
  const headerMenu = await prisma.menu.upsert({
    where: { location: 'HEADER' },
    update: {},
    create: { name: 'Header Menu', location: 'HEADER' },
  });
  const existingHeaderItems = await prisma.menuItem.findMany({ where: { menuId: headerMenu.id } });
  if (existingHeaderItems.length === 0) {
    const headerItems = [
      { label: 'Home', url: '/', sortOrder: 0 },
      { label: 'Technology', url: '/category/technology', sortOrder: 1 },
      { label: 'SEO', url: '/category/seo', sortOrder: 2 },
      { label: 'Marketing', url: '/category/marketing', sortOrder: 3 },
    ];
    for (const item of headerItems) {
      await prisma.menuItem.create({ data: { ...item, menuId: headerMenu.id } });
    }
  }

  const footerMenu = await prisma.menu.upsert({
    where: { location: 'FOOTER' },
    update: {},
    create: { name: 'Footer Menu', location: 'FOOTER' },
  });
  const existingFooterItems = await prisma.menuItem.findMany({ where: { menuId: footerMenu.id } });
  if (existingFooterItems.length === 0) {
    const footerItems = [
      { label: 'Home', url: '/', sortOrder: 0 },
      { label: 'Search', url: '/search', sortOrder: 1 },
    ];
    for (const item of footerItems) {
      await prisma.menuItem.create({ data: { ...item, menuId: footerMenu.id } });
    }
  }
  console.log('Menus seeded.');

  // 6. Sample post
  const techCat = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const jsTag = await prisma.tag.findUnique({ where: { slug: 'javascript' } });
  const nextTag = await prisma.tag.findUnique({ where: { slug: 'nextjs' } });

  const existingPost = await prisma.post.findUnique({ where: { slug: 'getting-started-with-dvb-cms' } });
  if (!existingPost) {
    const post = await prisma.post.create({
      data: {
        title: 'Getting Started with DVB CMS',
        slug: 'getting-started-with-dvb-cms',
        content: '<h2>Welcome to DVB CMS</h2><p>DVB is a modern content management system built with Next.js 14, designed for bloggers and content creators who care about <strong>SEO</strong>, <strong>AEO</strong> (Answer Engine Optimization), and <strong>GEO</strong> (Generative Engine Optimization).</p><h3>Key Features</h3><ul><li>Full WYSIWYG, Markdown, and HTML editors</li><li>Comprehensive SEO tools with real-time scoring</li><li>JSON-LD structured data for every post</li><li>Dynamic XML sitemap and robots.txt</li><li>llms.txt for AI crawler guidance</li><li>Media library with S3 cloud storage</li><li>Category and tag taxonomy</li><li>Custom menu management</li><li>301/302/410 redirect manager</li><li>404 error monitoring</li><li>Import/Export in JSON and WordPress XML</li></ul><h3>Getting Started</h3><p>Head to the admin panel to start creating content. Configure your site settings, set up your menus, and publish your first post. Every page is optimized for search engines and AI assistants out of the box.</p>',
        excerpt: 'Learn how to set up and use DVB CMS, a modern content management system optimized for SEO, AEO, and GEO.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: admin.id,
        metaTitle: 'Getting Started with DVB CMS — Your SEO-Optimized Blog Platform',
        metaDescription: 'DVB CMS is a Next.js powered content management system with built-in SEO, AEO, and GEO optimization. Learn how to get started.',
        focusKeyword: 'DVB CMS',
        schemaType: 'Article',
        readingTime: 3,
        wordCount: 150,
      },
    });

    if (techCat) {
      await prisma.categoriesOnPosts.create({ data: { postId: post.id, categoryId: techCat.id } });
    }
    if (jsTag) {
      await prisma.tagsOnPosts.create({ data: { postId: post.id, tagId: jsTag.id } });
    }
    if (nextTag) {
      await prisma.tagsOnPosts.create({ data: { postId: post.id, tagId: nextTag.id } });
    }
    console.log('Sample post created.');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
