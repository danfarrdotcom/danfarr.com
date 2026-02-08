import React from 'react';

export default function ChatInput() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#212121] p-4 z-10">
      <div className="max-w-3xl mx-auto relative flex items-center">
        <div className="w-full bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] py-3.5 pl-4 pr-12 flex items-center">
          <button className="mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Ask Dan anything"
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-base focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500"
            disabled
          />
        </div>
        <button
          className="absolute right-3 p-2 bg-[#d7d7d7] dark:bg-zinc-700 rounded-full text-white transition-colors cursor-not-allowed"
          disabled
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-white"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
      <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
        Dan can make mistakes. Check important info.
      </div>
    </div>
  );
}
