import Link from 'next/link';
import { databaseId, getDatabase, getPosts } from '../lib/notion';
import Text from '../components/text';
import styles from './index.module.css';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import dayjs from 'dayjs';
import '../styles/globals.css';
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  return {
    title: 'Dan Farr',
  };
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-lg mb-5">Dan Farr</h1>
        <p>
          A{' '}
          <a
            href="e9381a823d59bde3d9b0a011a36fb74f.jpg"
            target="_blank"
            rel="noreferrer"
          >
            skeptical optimist
          </a>{' '}
          who sometimes expresses ideas using code.
        </p>
        <p>
          Currently technical lead at{' '}
          <a
            className="hover:text-blue-800 text-blue-500 transition-colors duration-200"
            href="https://bluecrestwellness.com"
            target="_blank"
            rel="noreferrer"
          >
            Bluecrest Wellness
          </a>
          .{' '}
        </p>

        <p>
          I like empowering teams, sharing knowledge and making people feel like
          they matter.
        </p>
      </header>
      <section>
        <h2>Writing</h2>
        <ol className={styles.posts}>
          {posts.map((post) => {
            const date = new Date(post.last_edited).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });
            const slug = post.slug.toLowerCase().replace(/\s+/g, '-');
            return (
              <li key={post.id} className={styles.post}>
                <p className={styles.postTitle}>
                  <Link
                    className="hover:text-blue-800 text-blue-500 text-base transition-colors duration-200"
                    href={`/article/${slug}`}
                  >
                    {post.title}
                  </Link>
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
