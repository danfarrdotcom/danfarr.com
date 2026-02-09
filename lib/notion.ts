import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { cache } from 'react';

export const revalidate = 3600; // revalidate the data at most every hour

export const databaseId = process.env.NOTION_DATABASE_ID;

if (!databaseId) {
  throw new Error(
    'NOTION_DATABASE_ID is not defined in the environment variables.'
  );
}
/**
 * Returns a random integer between the specified values, inclusive.
 * The value is no lower than `min`, and is less than or equal to `max`.
 *
 * @param {number} minimum - The smallest integer value that can be returned, inclusive.
 * @param {number} maximum - The largest integer value that can be returned, inclusive.
 * @returns {number} - A random integer between `min` and `max`, inclusive.
 */
function getRandomInt(minimum: number, maximum: number): number {
  const min = Math.ceil(minimum);
  const max = Math.floor(maximum);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const formatPost = (page: PageObjectResponse) => {
  const properties = page.properties as any;
  return {
    id: page.id,
    summary: properties?.summary?.rich_text?.[0]?.text?.content ?? '',
    created: page.created_time,
    slug: properties?.slug?.formula?.string ?? '',
    date: properties?.date?.date?.start,
    tags: properties?.tags?.multi_select?.map((tag: any) => tag.name) ?? [],
    image: properties?.image?.url,
    last_edited: page.last_edited_time,
    published: properties?.published?.checkbox,
    duration: properties?.duration?.number,
    title: properties?.title?.title?.[0]?.plain_text ?? 'Untitled',
  };
};

export const getDatabase = cache(async () => {
  const response = await notion.databases.query({
    database_id: databaseId as string,
    filter: {
      property: 'published',
      checkbox: {
        equals: true,
      },
    },
  });
  return response.results as PageObjectResponse[];
});

export async function getPosts() {
  const database = await getDatabase();

  return database.map((page) => {
    return formatPost(page);
  });
}

export const getPage = cache(async (pageId: string) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
});

export const getPostBySlug = cache(async (slug: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'slug',
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });

  return response?.results?.length ? formatPost(response.results[0]) : null;
});

export const getBlocks = cache(async (blockID: string): Promise<any[]> => {
  const blockId = blockID.replace(/-/g, '');

  const { results } = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });

  // Fetches all child blocks recursively
  // be mindful of rate limits if you have large amounts of nested blocks
  // See https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = results.map(async (block) => {
    if ('has_children' in block && block.has_children) {
      const children = await getBlocks(block.id);
      return { ...block, children };
    }
    return block;
  });

  return Promise.all(childBlocks).then((blocks) =>
    blocks.reduce<any[]>((acc, curr: any) => {
      if (curr.type === 'bulleted_list_item') {
        if (acc[acc.length - 1]?.type === 'bulleted_list') {
          acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
        } else {
          acc.push({
            id: getRandomInt(10 ** 99, 10 ** 100).toString(),
            type: 'bulleted_list',
            bulleted_list: { children: [curr] },
          });
        }
      } else if (curr.type === 'numbered_list_item') {
        if (acc[acc.length - 1]?.type === 'numbered_list') {
          acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
        } else {
          acc.push({
            id: getRandomInt(10 ** 99, 10 ** 100).toString(),
            type: 'numbered_list',
            numbered_list: { children: [curr] },
          });
        }
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
  );
});
