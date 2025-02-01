import Head from "next/head";
import Image from "next/image";
import solana from '/public/solana.png';

export default function Home() {
  return (
    <>
      <Head>
        <title>SolVortex - Launch Your Solana Token</title>
        <link rel="icon" href='/public/solana.png'/>
        <meta name="description" content="SolVortex is the ultimate platform to launch and manage your Solana tokens with ease." />
      </Head>
      <main className="container mx-auto px-4 my-28">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 mb-20">
          <div className="order-2 md:order-1">
            <h1 className="text-5xl font-bold mb-6 text-white">Welcome to SolVortex</h1>
            <p className="text-2xl text-yellow-50 mb-4">Launch your Solana token in just a few simple steps.</p>
            <p className="text-2xl text-yellow-50">SolVortex is the ultimate platform to ignite your token’s potential.</p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <Image src={solana} width={300} height={300} alt="Solana Logo" className="rounded-lg shadow-lg hidden lg:block transition-all duration-300 hover:scale-105" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-black p-8 hover:shadow-xl transition-all duration-100 transform hover:scale-105 [background:linear-gradient(45deg,#000000,theme(colors.slate.900)_50%,#000000)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] rounded-2xl border border-transparent animate-border">
            <h2 className="text-2xl font-bold mb-4 text-white">Create and Send Token</h2>
            <p className="text-gray-300">
            Easily create and send custom tokens on the Solana blockchain with just a few clicks.
            </p>
          </div>

          <div className="bg-black p-8 hover:shadow-xl transition-all duration-200 transform hover:scale-105 [background:linear-gradient(45deg,#000000,theme(colors.slate.900)_50%,#000000)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] rounded-2xl border border-transparent animate-border">
            <h2 className="text-2xl font-bold mb-4 text-white">Airdrop Solana</h2>
            <p className="text-gray-300">
              Distribute SOL tokens to multiple addresses effortlessly using our airdrop feature.
            </p>
          </div>

          <div className="bg-black p-8 hover:shadow-xl transition-all duration-200 transform hover:scale-105 [background:linear-gradient(45deg,#000000,theme(colors.slate.900)_50%,#000000)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] rounded-2xl border border-transparent animate-border">
            <h2 className="text-2xl font-bold mb-4 text-white">Send Solana</h2>
            <p className="text-gray-300">
            Quickly send SOL tokens to any wallet address on the Solana network.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
