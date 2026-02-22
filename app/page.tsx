import Link from 'next/link';
import { getPosts } from '../lib/notion';
import ChatMessage from '../components/chat/message';
import ChatInput from '../components/chat/input';
import ChatLayout from '../components/chat/chat-layout';
import '../styles/globals.css';
import { Metadata } from 'next';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

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
              <p>Nice to meet you!</p>
            </div>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <div className="space-y-2">
              <p>
                I'm interested in cybernetics, distributed systems and bionics
                applied in software engineering.
              </p>
            </div>
          </ChatMessage>

          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              Currently I'm working as a technical lead at{' '}
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
              We have a strong focus on making prevention-focused healthcare
              more accessible using through technology.
            </p>
          </ChatMessage>

          {/* Philosophy */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p>
              My role is centered around empowering teams, sharing knowledge and
              making people feel like they matter.
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
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
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
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <div className="flex flex-col">
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                <p>Here's some things I've been working on:</p>
              </div>
              <div className="flex flex-col gap-6">
                <a
                  href="https://danny.engineering"
                  target="_blank"
                  rel="noreferrer"
                  className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-blue-400"
                >
                  <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    danny.engineering
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    My engineering portfolio and technical writing.
                  </div>
                </a>
                <a
                  href="https://practically.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-blue-400"
                >
                  <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    practically.dev
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    A product focused education platform for non-technical
                    people.
                  </div>
                </a>
                <a
                  href="https://loveyourepo.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-blue-400"
                >
                  <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    loveyourepo.dev
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    A tool to help you maintain your repositories.
                  </div>
                </a>
                {/* <a
                  href="https://barbequeue.co.uk"
                  target="_blank"
                  rel="noreferrer"
                  className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-blue-400"
                >
                  <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    barbequeue.co.uk
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    A Slack queueing tool.
                  </div>
                </a> */}
              </div>
            </div>
          </ChatMessage>

          {/* Social Links */}
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <p className="mb-2">Feel free to reach out and connect: </p>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <a
              href="https://github.com/danfarr"
              target="_blank"
              rel="noreferrer"
              className="py-2 flex bg-gray-100 gap-x-1 dark:bg-zinc-900 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <i>@danfarr</i>
              on
              <div>GitHub</div>
              <FaGithub size={20} />
            </a>
          </ChatMessage>
          <ChatMessage role="assistant" avatarUrl={AVATAR_URL}>
            <a
              href="https://github.com/danfarr"
              target="_blank"
              rel="noreferrer"
              className="py-2 flex bg-gray-100 gap-x-1 dark:bg-zinc-900 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <i>@drfarr</i>
              on
              <div>LinkedIn</div>
              <FaLinkedin size={20} />
            </a>
          </ChatMessage>
        </ChatLayout>
      </div>

      <ChatInput />
    </main>
  );
}
