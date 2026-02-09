'use client';

import React, { useState, useEffect, useRef } from 'react';
import TypingIndicator from './typing-indicator';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const getMessageText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';

  if (Array.isArray(node)) {
    return node.map(getMessageText).join('');
  }

  if (React.isValidElement(node)) {
    // Traverse down into children
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return getMessageText(props.children);
    }
  }

  return '';
};

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

    const nextMessage = messages[visibleCount];
    const textContent = getMessageText(nextMessage);
    const charCount = textContent.length;

    // Calculate delay based on character count
    // Base delay of 500ms + 15ms per character
    // Add a small random variance of 0-500ms
    const baseDelay = 500;
    const typingSpeed = 15;
    const randomVariance = Math.random() * 500;

    // Ensure a minimum duration so it doesn't flash too quickly for very short messages
    const typingDuration = Math.max(
      1000,
      baseDelay + charCount * typingSpeed + randomVariance
    );

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
