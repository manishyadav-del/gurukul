export default function QuoteRibbon() {
  return (
    <div className="bg-[#13382c] rounded-2xl py-4 sm:py-5 px-6 text-center shadow-xs border border-[#0f2e24] my-4">
      <div className="flex items-center justify-center gap-3 text-[#d4a359]">
        {/* Golden Left Flourish */}
        <span className="text-xl sm:text-2xl select-none opacity-80">
          ❦
        </span>

        <p className="font-serif italic text-sm sm:text-base lg:text-lg font-medium text-[#fcf9f2] tracking-wide">
          “Seek, Learn, Share — Let Knowledge Light the Way”
        </p>

        {/* Golden Right Flourish */}
        <span className="text-xl sm:text-2xl select-none opacity-80">
          ❧
        </span>
      </div>
    </div>
  );
}
