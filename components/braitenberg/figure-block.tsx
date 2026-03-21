import type { ReactNode } from 'react';

type FigureBlockProps = {
  figure: string;
  label: string;
  caption: string;
  children: ReactNode;
};

export default function FigureBlock({
  figure,
  label,
  caption,
  children,
}: FigureBlockProps) {
  return (
    <figure className=" border-stone-300 py-4">
      <div className="mb-4 flex font-sans flex-wrap items-center justify-between gap-3 text-sm   text-black">
        <span>{figure}</span>
        <span>{label}</span>
      </div>
      <div>{children}</div>
      <figcaption className="mt-4 max-w-2xl text-[0.98rem] italic leading-7 text-black">
        {caption}
      </figcaption>
    </figure>
  );
}
