import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MEN_SIZES = [
  { eu: "39", uk: "5.5", us: "6.5", cm: "24.5" },
  { eu: "40", uk: "6", us: "7", cm: "25" },
  { eu: "40.5", uk: "6.5", us: "7.5", cm: "25.5" },
  { eu: "41", uk: "7", us: "8", cm: "26" },
  { eu: "42", uk: "7.5", us: "8.5", cm: "26.5" },
  { eu: "42.5", uk: "8", us: "9", cm: "27" },
  { eu: "43", uk: "8.5", us: "9.5", cm: "27.5" },
  { eu: "44", uk: "9", us: "10", cm: "28" },
  { eu: "44.5", uk: "9.5", us: "10.5", cm: "28.5" },
  { eu: "45", uk: "10", us: "11", cm: "29" },
  { eu: "46", uk: "11", us: "12", cm: "29.5" },
  { eu: "47", uk: "12", us: "13", cm: "30.5" },
];

const WOMEN_SIZES = [
  { eu: "36", uk: "3.5", us: "5.5", cm: "22.5" },
  { eu: "36.5", uk: "4", us: "6", cm: "23" },
  { eu: "37", uk: "4.5", us: "6.5", cm: "23.5" },
  { eu: "37.5", uk: "5", us: "7", cm: "23.8" },
  { eu: "38", uk: "5.5", us: "7.5", cm: "24" },
  { eu: "38.5", uk: "6", us: "8", cm: "24.5" },
  { eu: "39", uk: "6.5", us: "8.5", cm: "25" },
  { eu: "40", uk: "7", us: "9", cm: "25.5" },
  { eu: "40.5", uk: "7.5", us: "9.5", cm: "26" },
  { eu: "41", uk: "8", us: "10", cm: "26.5" },
];

const KIDS_SIZES = [
  { eu: "28", uk: "10", us: "11", cm: "17" },
  { eu: "29", uk: "11", us: "12", cm: "18" },
  { eu: "30", uk: "12", us: "13", cm: "18.5" },
  { eu: "31", uk: "12.5", us: "13.5", cm: "19" },
  { eu: "32", uk: "1", us: "1.5", cm: "20" },
  { eu: "33", uk: "1.5", us: "2", cm: "20.5" },
  { eu: "34", uk: "2", us: "2.5", cm: "21.5" },
  { eu: "35", uk: "2.5", us: "3", cm: "22" },
];

function SizeTable({ sizes }: { sizes: typeof MEN_SIZES }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/30">
            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">EU</th>
            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">UK</th>
            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">US</th>
            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">CM</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((s, i) => (
            <tr key={s.eu} className={i % 2 === 0 ? "bg-background" : "bg-secondary/10"}>
              <td className="px-4 py-3 font-bold text-accent">{s.eu}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.uk}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.us}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.cm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuide() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Fit Guide</p>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter">Size Guide</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          NANO SHOES uses EU sizing. Use the chart below to find your perfect fit.
        </p>
      </div>

      <div className="bg-secondary/20 border border-border rounded-2xl p-5 mb-8">
        <h3 className="font-bold uppercase tracking-wider text-sm mb-3">How to Measure Your Foot</h3>
        <ol className="text-muted-foreground text-sm space-y-2 list-decimal list-inside leading-relaxed">
          <li>Place a sheet of paper on a flat, hard floor and stand on it with your heel against a wall.</li>
          <li>Mark the longest point of your foot (usually your big toe) on the paper.</li>
          <li>Measure the distance from the wall to the mark in centimeters.</li>
          <li>Use the CM column to find your EU size in the chart below.</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">Tip: Measure both feet and use the larger measurement.</p>
      </div>

      <Tabs defaultValue="men">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="men" className="flex-1 font-display uppercase tracking-wider">Men</TabsTrigger>
          <TabsTrigger value="women" className="flex-1 font-display uppercase tracking-wider">Women</TabsTrigger>
          <TabsTrigger value="kids" className="flex-1 font-display uppercase tracking-wider">Kids</TabsTrigger>
        </TabsList>
        <TabsContent value="men"><SizeTable sizes={MEN_SIZES} /></TabsContent>
        <TabsContent value="women"><SizeTable sizes={WOMEN_SIZES} /></TabsContent>
        <TabsContent value="kids"><SizeTable sizes={KIDS_SIZES} /></TabsContent>
      </Tabs>

      <div className="mt-8 bg-secondary/20 border border-border rounded-xl p-5">
        <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Fit Tips</h3>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
          <li><strong>Running styles</strong>: Consider going half a size up for extra toe room.</li>
          <li><strong>Casual & lifestyle</strong>: True to size.</li>
          <li><strong>Formal</strong>: True to size or half size down for a snug fit.</li>
          <li>If between sizes, always size up.</li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Still not sure? <a href="/contact" className="text-foreground font-bold hover:text-accent transition-colors">Contact us</a> — we'll help you find the perfect fit.
        </p>
      </div>
    </div>
  );
}
