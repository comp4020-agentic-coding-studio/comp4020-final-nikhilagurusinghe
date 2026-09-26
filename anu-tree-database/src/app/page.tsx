import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col p-3 w-full h-full items-center justify-center font-sans">
      <main className="flex flex-1 w-full h-full flex-row items-center gap-x-3">
        <div className="h-full bg-blue-200 flex-2/3 rounded-lg">
          <nav>

          </nav>
          map
        </div>
        <div className="h-full bg-blue-200 flex-1/3 rounded-lg">
          info panel
        </div>
        
      </main>
    </div>
  );
}
