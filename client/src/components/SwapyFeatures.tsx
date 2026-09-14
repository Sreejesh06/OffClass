import { useMemo, useState, useCallback } from "react";
import { type SlotItemMapArray, utils } from "swapy";
import { SwapyItem, SwapyLayout, SwapySlot } from "./ui/swapy-draggable-card";
import { PlusCircle, Shield, Trophy } from "lucide-react";

export function CTFScoreCard() {
  return (
    <div className="bg-emerald-600 rounded-xl h-full p-6 flex flex-col justify-center items-center text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black group cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <div className="flex gap-2">
        <h2 className="text-yellow-200 2xl:text-5xl text-3xl font-bold mb-2">4,875</h2>
        <div className="text-yellow-200 flex items-center gap-1 mb-1">
          <span className="text-xl"><Trophy className="text-yellow-200" size={24}/></span>
        </div>
      </div>
      <p className="text-yellow-200 font-bold font-mono">Global Rank Points</p>
      <p className="text-emerald-950 font-bold text-sm mt-2 px-3 py-1 bg-emerald-500 rounded-full">Top 1%</p>
    </div>
  );
}

export function HouseMembersCard() {
  return (
    <div className="bg-crypto-purple rounded-xl h-full p-6 flex flex-col justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <p className="text-white mb-1 font-bold font-mono">Active Members</p>
      <h2 className="text-white 2xl:text-6xl text-4xl font-extrabold leading-none font-heading mt-2">574</h2>
      <p className="text-yellow-300 font-bold mt-4">+12 this week</p>
    </div>
  );
}

export function TeamCard() {
  return (
    <div className="bg-blue-100 rounded-xl p-6 h-full flex flex-col justify-between relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <div className="bg-crypto-cyan text-black font-bold px-4 py-2 rounded-xl inline-block mb-4 max-w-fit font-mono text-sm border-2 border-black">
        Red Team Operations
      </div>
      <div>
        <p className="font-bold text-gray-800 font-sans">Machines Pwned</p>
        <div className="flex items-end gap-2">
          <span className="text-6xl font-extrabold text-gray-900 font-heading">54</span>
          <span className="text-green-600 font-bold mb-1">+40%</span>
        </div>
      </div>
    </div>
  );
}

export function AgencyCard() {
  return (
    <div className="bg-crypto-yellow rounded-xl h-full p-4 relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white text-lg font-bold px-4 py-2 rounded-lg inline-block mb-4 w-full font-heading leading-tight">
        <p>Cyber Defense</p>
        <p>Training &</p>
        <p>Analytics</p>
      </div>
      <div className="flex gap-2 h-20">
        <div className="w-full rounded-xl bg-crypto-pink border-2 border-black overflow-hidden"></div>
        <div className="w-full rounded-xl bg-crypto-cyan border-2 border-black overflow-hidden ml-2"></div>
      </div>
    </div>
  );
}

export function LogoCard() {
  return (
    <div className="bg-pink-200 rounded-xl h-full p-6 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white">
        <Shield size={32} />
      </div>
      <h2 className="2xl:text-3xl text-xl font-extrabold text-gray-900 font-heading">Security First</h2>
    </div>
  );
}

export function UserTrustCard() {
  return (
    <div className="bg-gray-900 rounded-xl h-full p-5 flex flex-col justify-center items-center text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <h3 className="text-xl font-bold mb-2 font-display">Active Students</h3>
      <p className="text-3xl font-extrabold mb-4 font-heading text-crypto-cyan">500+</p>

      <div className="flex -space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 bg-red-500 flex justify-center items-center text-white font-bold text-xs">R</div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 bg-blue-500 flex justify-center items-center text-white font-bold text-xs">B</div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 bg-green-500 flex justify-center items-center text-white font-bold text-xs">G</div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 bg-crypto-purple flex justify-center items-center text-white font-bold text-xs">P</div>
        <div className="w-10 h-10 rounded-full bg-crypto-pink border-2 border-gray-900 flex items-center justify-center z-10 text-black">
          <PlusCircle className="w-6 h-6" />
        </div>
      </div>

      <p className="text-sm font-mono text-gray-400">Join a House.</p>
    </div>
  )
}

export function FontCard() {
  return (
    <div className="bg-white rounded-xl h-full p-6 col-span-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <h2 className="text-2xl font-extrabold mb-1 text-gray-900 font-heading">Houses</h2>
      <p className="mb-6 text-gray-500 font-mono text-sm font-bold">Choose your path</p>

      <div className="flex gap-3 mt-4">
        <div className="w-10 h-10 bg-red-500 rounded-md shadow-sm border-2 border-black hover:rotate-12 transition-transform"></div>
        <div className="w-10 h-10 bg-blue-500 rounded-md shadow-sm border-2 border-black hover:rotate-12 transition-transform"></div>
        <div className="w-10 h-10 bg-green-500 rounded-md shadow-sm border-2 border-black hover:rotate-12 transition-transform"></div>
        <div className="w-10 h-10 bg-crypto-purple rounded-md shadow-sm border-2 border-black hover:rotate-12 transition-transform"></div>
      </div>
    </div>
  );
}

export function DesignIndustryCard() {
  return (
    <div className="bg-crypto-pink text-black rounded-xl h-full p-6 flex flex-col justify-between relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <div className="space-y-1">
        <p className="text-3xl font-extrabold font-heading leading-tight">Learn.</p>
        <p className="text-3xl font-extrabold font-heading leading-tight">Hack.</p>
        <p className="text-3xl font-extrabold font-heading leading-tight">Repeat.</p>
      </div>
      <div className="mt-4 flex gap-2">
         <div className="h-3 w-8 bg-black rounded-full"></div>
         <div className="h-3 w-3 bg-black rounded-full"></div>
      </div>
    </div>
  );
}

export function CardBalanceCard() {
  return (
    <div className="bg-crypto-bg rounded-xl h-full p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
      <h3 className="text-xl font-bold mb-4 text-neutral-950 font-display">Wallet Points</h3>
      <h2 className="text-4xl font-extrabold mb-6 text-crypto-purple font-heading">4,457 <span className="text-lg">pts</span></h2>

      <div className="bg-black text-white rounded-lg p-4 shadow-sm border-2 border-crypto-yellow">
        <div className="flex justify-between text-sm mb-2 font-mono text-gray-400">
          <span >Student ID</span>
          <span >Status</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>7338217XXX</span>
          <span className="text-crypto-cyan">Active</span>
        </div>
      </div>
    </div>
  )
}

type Item = {
  id: string;
  title: string;
  widgets: React.ReactNode;
  className?: string;
};

const initialItems: Item[] = [
  { id: "1", title: "1", widgets: <CTFScoreCard />, className: "lg:col-span-4 sm:col-span-7 col-span-12" },
  { id: "2", title: "2", widgets: <HouseMembersCard  />, className: "lg:col-span-3 sm:col-span-5 col-span-12" },
  { id: "3", title: "3", widgets: <DesignIndustryCard />, className: "lg:col-span-5 sm:col-span-5 col-span-12" },
  { id: "4", title: "4", widgets: <TeamCard/>, className: "lg:col-span-5 sm:col-span-7 col-span-12" },
  { id: "5", title: "5", widgets: <LogoCard />, className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "6", title: "6", widgets: <FontCard />, className: "lg:col-span-3 sm:col-span-6 col-span-12" },
  { id: "7", title: "7", widgets: <AgencyCard />, className: "lg:col-span-4 sm:col-span-5 col-span-12" },
  { id: "8", title: "8", widgets: <UserTrustCard />, className: "lg:col-span-4 sm:col-span-7 col-span-12" },
  { id: "9", title: "9", widgets: <CardBalanceCard />, className: "lg:col-span-4 sm:col-span-12 col-span-12" },
];

export function SwapyFeatures() {
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(initialItems, "id")
  );

  const slottedItems = useMemo(
    () => utils.toSlottedItems(initialItems, "id", slotItemMap),
    [slotItemMap]
  );

  const swapyConfig = useMemo(() => ({ swapMode: "hover" as const }), []);
  
  const handleSwap = useCallback((event: any) => {
    // Intentionally not updating React state here.
    // Swapy handles the DOM manipulation internally.
    // Updating React state causes a re-render that wipes the dragged elements.
    console.log('Swapped items:', event.newSlotItemMap.asArray);
  }, []);

  return (
    <section className="py-24 bg-white px-6 overflow-hidden relative">
      <div className="max-w-5xl mx-auto text-center mb-12 relative z-10">
        <div className="inline-block px-3 py-1 bg-crypto-yellow text-black rounded-full text-sm font-mono font-bold mb-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-2">
          #Interactive
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-6">
          Drag & Drop Dashboard
        </h2>
        <p className="text-gray-700 font-medium max-w-2xl mx-auto font-sans text-lg">
          Try dragging the cards below.
        </p>
      </div>

      <SwapyLayout
        id="swapy"
        className="w-full max-w-6xl mx-auto p-4 relative z-10"
        config={swapyConfig}
        onSwap={handleSwap}
      >
        <div className="grid w-full grid-cols-12 gap-4 md:gap-6 py-4">
          {slottedItems.map(({ slotId, itemId }) => {
            const item = initialItems.find((i) => i.id === itemId);

            return (
              <SwapySlot
                key={slotId}
                className={`swapyItem h-[260px] ${item?.className}`}
                id={slotId}
              >
                <SwapyItem
                  id={itemId}
                  className="relative w-full h-full"
                  key={itemId}
                >
                  {item?.widgets}
                </SwapyItem>
              </SwapySlot>
            );
          })}
        </div>
      </SwapyLayout>
    </section>
  );
}
