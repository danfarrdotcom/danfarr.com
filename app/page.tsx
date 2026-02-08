import Link from 'next/link';
import { getPosts } from '../lib/notion';
import ChatMessage from '../components/chat/message';
import ChatInput from '../components/chat/input';
import ChatLayout from '../components/chat/chat-layout';
import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dan Farr',
};

// Using the image referenced in the original file
const AVATAR_URL = '/e9381a823d59bde3d9b0a011a36fb74f.jpg';

export default async function Page() {
  const _posts = await getPosts();
  const posts = _posts.splice(0, 3); // Show only the 5 most recent posts

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-32 pt-10 px-4 md:px-0 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col">
        <ChatLayout>
          {/* Intro */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <div className="space-y-2">
              <p>Hi, I'm Dan.</p>
            </div>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <div className="space-y-2">
              <p>It's nice to meet you.</p>
            </div>
          </ChatMessage>
          {/* <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              I'm a{' '}
              <a
                href={AVATAR_URL}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-blue-400/50 hover:decoration-blue-500 hover:text-blue-600 transition-all"
              >
                skeptical optimist
              </a>{' '}
              who sometimes expresses ideas using code.
            </p>
          </ChatMessage> */}

          {/* Current Role */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              I'm currently a technical lead at{' '}
              <a
                className="text-blue-500 font-medium hover:underline"
                href="https://bluecrestwellness.com"
                target="_blank"
                rel="noreferrer"
              >
                Bluecrest Wellness
              </a>
              .
            </p>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              At the moment I'm working as focused on making prevention-focused
              healthcare more accessible and effective through technology.
            </p>
          </ChatMessage>

          {/* Philosophy */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              I like empowering teams, sharing knowledge and making people feel
              like they matter.
            </p>
          </ChatMessage>

          {/* Projects List */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <div className="flex flex-col">
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                <p>
                  I try to write every now and then, often about stuff I've
                  recently been working on.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                {posts.map((post) => {
                  const slug = post.slug.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={post.id}
                      href={`/article/${slug}`}
                      className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-blue-400"
                    >
                      <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {post.summary || 'No description available.'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              You can read more of my writing by{' '}
              <Link className="text-blue-500 underline" href="/articles">
                clicking here
              </Link>
              .
            </p>
          </ChatMessage>

          {/* Social Links */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p className="mb-2">You can also find me elsewhere on the web:</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://github.com/danfarr"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-900 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/danfarr"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-900 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </ChatMessage>
        </ChatLayout>
      </div>

      <ChatInput />
    </main>
  );
}
