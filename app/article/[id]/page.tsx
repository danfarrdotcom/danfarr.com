import { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import {
  getDatabase,
  getBlocks,
  getPostBySlug,
  getPosts,
} from '../../../lib/notion';
import Text from '../../../components/text';
import { renderBlock } from '../../../components/notion/renderer';
import styles from '../../../styles/post.module.css';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import dayjs from 'dayjs';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Logo from '../../../components/logo';

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return (await getPosts()).map((page) => {
    return {
      params: {
        id: page.id,
      },
    };
  });
}

export default async function Page({ params }: { params: { id: string } }) {
  const page = await getPostBySlug(params?.id);

  if (!page) {
    return notFound();
  }

  const blocks = await getBlocks(page?.id);

  if (!blocks) {
    return notFound();
  }

  return (
    <div>
      <Head>
        <title>{page.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className={styles.container}>
        <Link className="w-full text-center" href="/">
          <Logo />
        </Link>
      </nav>
      <article className={styles.container}>
        <h1 className={styles.name}>{page.title}</h1>
        <h2 className="text-sm my-5">
          {dayjs(page.date).format('MMMM D, YYYY')}
        </h2>
        <section>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </section>
      </article>
    </div>
  );
}

// export const getStaticPaths = async () => {
//   const database = await getDatabase(databaseId);
//   return {
//     paths: database.map((page) => {
//       const slug = page.properties.Slug?.formula?.string;
//       return ({ params: { id: page.id, slug } });
//     }),
//     fallback: true,
//   };
// };

// export const getStaticProps = async (context) => {
//   const { slug } = context.params;
//   const page = await getPage(id);
//   const blocks = await getBlocks(id);

//   return {
//     props: {
//       page,
//       blocks,
//     },
//     revalidate: 1,
//   };
// };
