import React from 'react';
import Image from 'next/image';

type ChatMessageProps = {
  role: 'assistant' | 'user';
  children: React.ReactNode;
  avatarUrl?: string; // Optional avatar
  timestamp?: string;
};

export default function ChatMessage({
  role,
  children,
  avatarUrl,
  timestamp,
}: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div
      className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in-up `}
    >
      <div
        className={`flex p-4 max-w-[100%] md:max-w-[85%] w-fit overflow-hidden bg-zinc-100 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-none !max-w-[450px] rounded-[20px] ${isAssistant ? 'flex-row items-start' : 'flex-row-reverse items-start'}`}
      >
        {/* Avatar */}
        {/* {isAssistant && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-gray-200 mr-4 mt-1">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={32} height={32} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                DF
              </div>
            )}
          </div>
        )} */}

        {/* Bubble */}
        <div className="flex flex-col min-w-0 w-full">
          {timestamp && (
            <span className="text-xs text-gray-400 mb-1 ml-1">{timestamp}</span>
          )}
          <div
            className={`text-base leading-relaxed break-words ${
              isAssistant
                ? 'text-gray-900 dark:text-gray-100'
                : 'bg-[#f4f4f4] dark:bg-[#2f2f2f] text-gray-900 dark:text-gray-100 rounded-3xl px-5 py-3'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
