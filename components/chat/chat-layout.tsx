'use client';

import React, { useState, useEffect, useRef } from 'react';
import TypingIndicator from './typing-indicator';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convert children to array to handle them one by one
  const messages = React.Children.toArray(children);

  useEffect(() => {
    // If we've shown all messages, stop.
    if (visibleCount >= messages.length) return;

    // Start "typing"
    setIsTyping(true);

    // Scroll to bottom when typing starts
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });

    // Vary the delay slightly to feel more natural.
    // We'll use a wider range to simulate thinking/typing of longer messages.
    // 1500ms base + up to 2000ms variance = 1.5s to 3.5s per message
    const typingDuration = 1500 + Math.random() * 2000;

    const timeoutId = setTimeout(() => {
      setIsTyping(false);
      setVisibleCount((prev) => prev + 1);
    }, typingDuration);

    return () => clearTimeout(timeoutId);
  }, [visibleCount, messages.length]);

  // Scroll to bottom whenever a new message appears
  useEffect(() => {
    // Scroll to the bottom of the page to ensure the latest message is visible
    // taking into account the fixed position input at the bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [visibleCount, isTyping]);

  return (
    <div className="flex flex-col w-full pb-48">
      {messages.slice(0, visibleCount)}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
