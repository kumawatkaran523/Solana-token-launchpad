'use client';

import Image from "next/image";
import solana from '/public/solana.png';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Navbar() {
    const wallet = useWallet();
    const router = useRouter();
    useEffect(() => {
        if (!wallet.connected) {
            router.push("/");
        }
    }, [wallet.connected, router]);
    return (
        <>
            <div className="bg-[#061625] py-4 shadow-xl text-white">
                <div className="mx-52 flex justify-between items-center">
                    <div className="text-4xl flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <Image src={solana} width={50} height={50} alt="Solana Logo" />
                        S o l V o r t e x
                    </div>
                    {
                        wallet.publicKey ? (
                            <div className="flex gap-10 items-center">
                                {/* <p className="text-xl font-bold hover:text-yellow-100 cursor-pointer" onClick={() => router.push('/mytoken')}>My Token</p> */}
                                <p className="text-xl font-bold hover:text-yellow-100 cursor-pointer" onClick={() => router.push('/createtoken')}>Create Token</p>
                                <p className="text-xl font-bold hover:text-yellow-100 cursor-pointer" onClick={() => router.push('/airdrop')}>Airdrop</p>
                                <p className="text-xl font-bold hover:text-yellow-100 cursor-pointer" onClick={() => router.push('/sendsol')}>Send SOL</p>
                                <WalletMultiButton />
                            </div>
                        ) : (
                            <div className="flex gap-10 items-center">
                                <WalletMultiButton />
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default Navbar;
