import type { ReactNode } from 'react';

type CalloutProps = {
  label: string;
  children: ReactNode;
};

export default function Callout({ label, children }: CalloutProps) {
  return (
    <div className="border-l border-stone-400 pl-5">
      <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-stone-500">
        {label}
      </p>
      <div className="space-y-4 text-[1.05rem] leading-8 text-stone-700">
        {children}
      </div>
    </div>
  );
}
