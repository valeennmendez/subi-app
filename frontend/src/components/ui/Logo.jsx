const SIZES = {
  bar: {
    mark: 'size-9 rounded-[10px] text-lg',
    word: 'text-[22px] font-bold',
  },
  auth: {
    mark: 'size-10 rounded-[12px] text-xl',
    word: 'text-[26px] font-extrabold',
  },
};

export function Logo({ size = 'bar', className = '' }) {
  const styles = SIZES[size] ?? SIZES.bar;

  return (
    <span className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-brand font-extrabold leading-none text-canvas ${styles.mark}`}
      >
        S
      </span>
      <span className={`tracking-tight ${styles.word}`}>Subi</span>
    </span>
  );
}
