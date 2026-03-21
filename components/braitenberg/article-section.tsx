import type { ReactNode } from 'react';

type ArticleSectionProps = {
  title?: string;
  children: ReactNode;
};

export default function ArticleSection({
  title,
  children,
}: ArticleSectionProps) {
  return (
    <section className="space-y-6 text-[1.08rem] leading-8 text-black">
      {title ? (
        <h2 className="font-serif text-[2rem] font-normal tracking-tight text-stone-950">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
