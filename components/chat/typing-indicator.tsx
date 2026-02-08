import Image from 'next/image';
import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex w-full mb-6 justify-start">
      <div className="flex max-w-[90%] md:max-w-[80%] flex-row justify-center items-center gap-x-4">
        {/* Avatar Placeholder/Ghost */}
        <div className="h-[32px] w-[32px] overflow-hidden mt-1 mr-30">
          <Image src="/logo.gif" alt="Dan's Avatar" width={32} height={32} />
        </div>

        {/* Bubble */}
        <div className="flex flex-col min-w-0 ju">
          <div className="flex space-x-1 h-5 items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
