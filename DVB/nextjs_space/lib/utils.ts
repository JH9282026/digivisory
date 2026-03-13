import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadingTime(content: string): number {
  const words = (content ?? '').replace(/<[^>]*>/g, '').split(/\s+/)?.filter(Boolean)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function calculateWordCount(content: string): number {
  return (content ?? '').replace(/<[^>]*>/g, '').split(/\s+/)?.filter(Boolean)?.length ?? 0;
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function seoScore(post: {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  content?: string;
  featuredImage?: string;
  excerpt?: string;
}): { score: number; checks: { label: string; passed: boolean; tip: string }[] } {
  const checks: { label: string; passed: boolean; tip: string }[] = [];
  const title = post?.metaTitle ?? post?.title ?? '';
  const desc = post?.metaDescription ?? '';
  const keyword = post?.focusKeyword ?? '';
  const content = post?.content ?? '';
  const plainContent = content.replace(/<[^>]*>/g, '');

  checks.push({ label: 'Title length (≤60 chars)', passed: title.length > 0 && title.length <= 60, tip: title.length === 0 ? 'Add a title' : title.length > 60 ? 'Title is too long' : 'Good' });
  checks.push({ label: 'Meta description (150-160 chars)', passed: desc.length >= 150 && desc.length <= 160, tip: desc.length === 0 ? 'Add a meta description' : desc.length < 150 ? 'Description is too short' : desc.length > 160 ? 'Description is too long' : 'Good' });
  checks.push({ label: 'Focus keyword set', passed: keyword.length > 0, tip: keyword.length === 0 ? 'Set a focus keyword' : 'Good' });
  
  if (keyword) {
    const kw = keyword.toLowerCase();
    checks.push({ label: 'Keyword in title', passed: title.toLowerCase().includes(kw), tip: 'Include your focus keyword in the title' });
    checks.push({ label: 'Keyword in description', passed: desc.toLowerCase().includes(kw), tip: 'Include your focus keyword in the meta description' });
    checks.push({ label: 'Keyword in content', passed: plainContent.toLowerCase().includes(kw), tip: 'Include your focus keyword in the content' });
  }
  
  checks.push({ label: 'Content length (≥300 words)', passed: (plainContent.split(/\s+/)?.length ?? 0) >= 300, tip: 'Write at least 300 words for better SEO' });
  checks.push({ label: 'Featured image', passed: !!(post?.featuredImage), tip: 'Add a featured image' });
  checks.push({ label: 'Excerpt / summary', passed: !!(post?.excerpt), tip: 'Add an excerpt for AEO' });

  const passed = checks.filter(c => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}
