'use client';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';


function Airdrop() {
    const wallet = useWallet();
    const [amount, setAmount] = useState<number | undefined>();
    const [loader, setLoader] = useState(false);
    const connection = new Connection('https://api.devnet.solana.com');

    const requestAirdrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet.publicKey || !amount) {
            toast.error("Wallet not connected or amount not selected.");
            return;
        }

        try {
            setLoader(true);
            await connection.requestAirdrop(
                wallet.publicKey,
                amount * LAMPORTS_PER_SOL
            );
            toast.success(`${amount} SOL Airdropped Successfully!`);
            setLoader(false);
        } catch (error) {
            console.log(error);
            setLoader(false);
            toast.error("You've either reached your airdrop limit today or the airdrop faucet has run dry.");
        }
    };

    return (
        <>

            <div className='flex items-center justify-evenly my-14'>
                <div className='text-white my-24 w-1/2 border border-gray-700 rounded-lg p-5'>
                    <p className='text-2xl font-bold'>Request Airdrop</p>
                    <p className='text-gray-400'>Maximum of 2 requests per hour</p>
                    <form onSubmit={requestAirdrop} className='my-7'>
                        <div className="flex items-center gap-3">
                            <Input
                                type="text"
                                value={wallet?.publicKey?.toString() || "Connect your wallet"}
                                className='rounded-lg py-6 text-lg border border-gray-700 bg-gray-800 text-gray-300'
                                disabled
                            />
                            <Select onValueChange={(value) => setAmount(parseFloat(value))}>
                                <SelectTrigger className="w-[130px] border border-gray-700 rounded-lg py-6 bg-gray-800 text-gray-300">
                                    <SelectValue placeholder="Amount" />
                                </SelectTrigger>
                                <SelectContent className='border border-gray-700 rounded-lg bg-gray-900 text-gray-300'>
                                    <SelectItem value="0.5">0.5 SOL</SelectItem>
                                    <SelectItem value="1">1 SOL</SelectItem>
                                    <SelectItem value="2.5">2.5 SOL</SelectItem>
                                    <SelectItem value="5">5 SOL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <button
                            type='submit'
                            disabled={loader || !wallet.publicKey || !amount}
                            className='border border-gray-700 rounded-lg py-3 text-black font-medium bg-slate-50 mt-4 w-full hover:text-white hover:bg-gray-900 transition-colors duration-200 flex justify-center items-center gap-2'
                        >
                            {loader ? <Loader2 className="animate-spin" /> : null}
                            {loader ? "Processing..." : "Confirm Airdrop"}
                        </button>
                    </form>
                </div>
                <div>
                    <img src="image.png" alt="Airdrop Illustration" width={400} className='rounded-lg' />
                </div>
            </div>
            <Toaster position='top-right' />
        </>
    );
}

export default Airdrop;