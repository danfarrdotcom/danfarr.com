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
    <figure className="border-t border-stone-300 pt-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-stone-700">
        <span>Figure {figure}</span>
        <span>{label}</span>
      </div>
      <div>{children}</div>
      <figcaption className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-stone-700">
        <span className="mr-2 text-[11px] uppercase tracking-[0.24em] text-black">
          Figure {figure}
        </span>
        {caption}
      </figcaption>
    </figure>
  );
}
