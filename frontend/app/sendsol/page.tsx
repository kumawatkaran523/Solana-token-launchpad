
'use client'
import { Input } from '@/components/ui/input'
import React, { FormEvent, useState } from 'react'

import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function Send() {
    const [recepeintAdd, setRecepientAdd] = useState<string>('');
    const [amount, setAmount] = useState<number | null>(null);
    const wallet = useWallet();
    const [loader, setLoader] = useState(false);

    const connection = new Connection('https://api.devnet.solana.com');

    const sendSol = async (e: FormEvent<HTMLFormElement>) => {
        try {
            setLoader(true);
            e.preventDefault();

            if (!wallet.publicKey || !amount || !recepeintAdd) {
                toast.error('Please fill in all fields and connect your wallet.');
                return;
            }

            const transaction = new Transaction();
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new PublicKey(recepeintAdd),
                    lamports: amount * LAMPORTS_PER_SOL
                })
            );

            await wallet.sendTransaction(transaction, connection);
            toast.success('SOL sent successfully!');
            setLoader(false);
            e.currentTarget.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
            setLoader(false);
        }
    };

    return (
        <>
            <div className='flex items-center justify-evenly my-20'>
                <div className='text-white my-24 w-1/2 border-[1px] border-gray-700 rounded-[5px] p-5'>
                    <p className='text-2xl font-bold'>Send SOL through SolVortex in just 2 + 1 step</p>
                    <form action="" className='my-7' onSubmit={sendSol}>
                        <Input 
                            type="text" 
                            placeholder="Recepient's Solana Address" 
                            className='rounded-[5px] py-6 text-3xl border-[1px] border-gray-700 my-4 focus:ring-1 focus:ring-blue-700 focus:border-blue-700' 
                            value={recepeintAdd} 
                            onChange={(e) => setRecepientAdd(e.target.value)} 
                        />
                        <Input 
                            type="number" 
                            placeholder="Amount" 
                            className='rounded-[5px] py-6 text-3xl border-[1px] border-gray-700 focus:ring-1 focus:ring-blue-700 focus:border-blue-700' 
                            value={amount ?? ''} 
                            onChange={(e) => setAmount(Number(e.target.value))} 
                        />
                        <button
                            type='submit'
                            disabled={loader || !wallet.publicKey || !amount}
                            className='border border-gray-700 rounded-lg py-3 text-black font-medium bg-slate-50 mt-4 w-full hover:text-white hover:bg-gray-900 transition-colors duration-200 flex justify-center items-center gap-2'
                        >
                            {loader ? <Loader2 className="animate-spin" /> : null}
                            {loader ? "Processing..." : "Send SOL"}
                        </button>
                    </form>
                </div>
                <div>
                    <img src="image.png" alt="" width={400} />
                </div>
            </div>
            <Toaster position='top-right' />
        </>
    );
}

export default Send;