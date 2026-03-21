import type { ReactNode } from 'react';

type CalloutProps = {
  label: string;
  children: ReactNode;
};

export default function Callout({ label, children }: CalloutProps) {
  return (
    <div className="border-t border-stone-300 pt-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-stone-700">
        {label}
      </p>
      <div className="space-y-4 text-[1.05rem] leading-8 text-black">
        {children}
      </div>
    </div>
  );
}
