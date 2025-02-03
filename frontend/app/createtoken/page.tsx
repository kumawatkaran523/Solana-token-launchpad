'use client';

import {
  createAssociatedTokenAccountInstruction,
  createInitializeInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import { pack } from '@solana/spl-token-metadata';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import axios from 'axios';
import { FormEvent, useState } from 'react';

export default function CreateToken() {
  const [loading,setLoading]=useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();
  const [step,setStep]=useState(-1);
  const steps = [
    'Uploading Image and Metadata to IPFS',
    'Create Mint Account',
    'Initializing Metadata',
    'Creating Associated Token Account',
    'Minting Tokens',
  ];

  const sendFileToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
          'Content-Type': 'multipart/form-data',
        },
      });

      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      throw error;
    } 
  };

  type data={
    name:string, symbol:string, decimal:string, supply:string, image:string 
  }
  const createTokenWithMetadata = async (dataObj: data, metadataURL: string) => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected');

      const keypair = Keypair.generate();
      const metadata = {
        mint: keypair.publicKey,
        name: dataObj.name,
        symbol: dataObj.symbol,
        uri: metadataURL,
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(keypair.publicKey, wallet.publicKey, keypair.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(keypair.publicKey, Number(dataObj.decimal), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: keypair.publicKey,
          metadata: keypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.partialSign(keypair);
      setStep(2);

      await wallet.sendTransaction(tx, connection);
      console.log('Token created:', keypair.publicKey.toBase58());

      const associatedToken = getAssociatedTokenAddressSync(keypair.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(wallet.publicKey, associatedToken, wallet.publicKey, keypair.publicKey, TOKEN_2022_PROGRAM_ID),
        createMintToInstruction(keypair.publicKey, associatedToken, wallet.publicKey, Number(dataObj.supply) * Math.pow(10, Number(dataObj.decimal)), [], TOKEN_2022_PROGRAM_ID)
      );
      setStep(3);
      await wallet.sendTransaction(transaction2, connection);
      setStep(4);
    } catch (error) {
      console.error('Error creating token:', error);
    }
  };

  const createToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStep(0);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const decimal = formData.get('decimal') as string;
    const supply = formData.get('supply') as string;
    const file = formData.get('file') as File;

    if (!name || !symbol || !decimal || !supply || !file) {
      return;
    }

    try {
      const [imageURL , jsonURI] : [string, string]= await Promise.all([
        sendFileToIPFS(file),
        sendFileToIPFS(new File([JSON.stringify({ name, symbol, decimal, supply, image: '' })], 'metadata.json', { type: 'application/json' })),
      ]);
      setStep(1);
      await createTokenWithMetadata({ name, symbol, decimal, supply, image: imageURL }, jsonURI);
      setStep(4);
    } catch (error) {
      console.error('Error in token creation process:', error);
    } 
    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <div className="my-10">
      <p className="text-center text-4xl font-bold text-white mt-20 mb-4">Solana Token Creator</p>
      <p className="text-center text-xl font-medium text-gray-300 mb-20">
        Easily create your own Solana SPL Token in just 7+1 steps without coding.
      </p>
      <form onSubmit={createToken} className="flex flex-col mx-auto max-w-3xl space-y-6 px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <span className="text-red-500 text-3xl align-middle mr-1">*</span>
              <span className="align-middle">Token Name</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ex. Solana"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <span className="text-red-500 text-3xl align-middle mr-1">*</span>
              Token Symbol
            </label>
            <input
              type="text"
              name="symbol"
              placeholder="Ex. SOL"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 ">
              <span className="text-red-500 text-3xl align-middle mr-1">*</span>Decimals
            </label>
            <input
              type="number"
              name="decimal"
              placeholder="Ex. 9"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              <span className="text-red-500 text-3xl align-middle mr-1">*</span>Total Supply
            </label>
            <input
              type="number"
              name="supply"
              placeholder="Ex. 1000000"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-600 transition duration-200">
            <div className="flex flex-col items-center justify-center pt-3 pb-3">
              <svg
                className="w-10 h-10 mb-4 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">SVG, PNG, or JPG (MAX. 800x400px)</p>
            </div>
            <div className='bg-slate-100 p-1 rounded-md'>
            <input type="file" name="file" className=" bg-gray-200" />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-[#512da8] text-white font-semibold rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? steps[step] : 'Create Token'}
        </button>
      </form>
  
    </div>

  );
}