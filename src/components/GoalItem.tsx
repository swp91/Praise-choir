function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

type Props = { index: number; text: string };

export default function GoalItem({ index, text }: Props) {
  const parts = text.split(/(찬양을 통해)/);
  return (
    <div className="px-6 py-5 border-b border-line-soft grid grid-cols-[56px_1fr] gap-4 items-start odd:border-r odd:border-line-soft [&:last-child:nth-child(odd)]:col-span-full [&:last-child:nth-child(odd)]:bg-gold/8 [&:last-child:nth-child(odd)]:border-r-0 max-[880px]:odd:border-r-0">
      <div className="font-en italic text-[28px] text-gold leading-none font-medium">{toRoman(index + 1)}</div>
      <div className="font-ko text-sm leading-relaxed">
        {parts.map((p, i) => p === '찬양을 통해' ? <b key={i} className="text-gold-deep">{p}</b> : p)}
      </div>
    </div>
  );
}
