import CountUp from "@/components/landing/count-number";

export default function StatsSection() {
  return (
    <section className="border-y border-gray-200 px-4 py-10 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="font-urbanist text-4xl font-semibold">
            <CountUp from={0} to={100} />%
          </h3>
          <p className="text-gray-500">Private transactions</p>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="font-urbanist text-4xl font-semibold">
            <CountUp from={0} to={60} />%
          </h3>
          <p className="text-gray-500">Less exposure on-chain</p>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="font-urbanist text-4xl font-semibold">
            <CountUp from={0} to={99.9} />%
          </h3>
          <p className="text-gray-500">Reliable stealth delivery</p>
        </div>
      </div>
    </section>
  );
}
