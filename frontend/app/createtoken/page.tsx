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
import { Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Confetti from 'react-confetti'
export default function CreateToken() {
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState(-1);
  const [congrats, setCongrats] = useState(false);
  
  const steps = [
    "Hold tight! We're launching your files into the IPFS galaxy... 🌌",
    "Waving our magic wand to create your mint account... ✨",
    "Picking out the perfect metadata outfit for your token... 👗",
    "Building a cozy home for your token... 🏠",
    "Minting your tokens with a sprinkle of crypto magic... 🪄",
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
      console.error('Error uploading to IPFS:', error);
      throw error; // Rethrow to handle in the main function
    }
  };
  type data = {
    name: string, symbol: string, decimal: string, supply: string, image: string
  }
  const createTokenWithMetadata = async (dataObj: data, metadataURL: string) => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected');

      // Initial setup
      setStep(1);
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

      setStep(2);
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

      await wallet.sendTransaction(tx, connection);
      console.log('Token created:', keypair.publicKey.toBase58());

      setStep(3);
      const associatedToken = getAssociatedTokenAddressSync(keypair.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(wallet.publicKey, associatedToken, wallet.publicKey, keypair.publicKey, TOKEN_2022_PROGRAM_ID),
        createMintToInstruction(keypair.publicKey, associatedToken, wallet.publicKey, Number(dataObj.supply) * Math.pow(10, Number(dataObj.decimal)), [], TOKEN_2022_PROGRAM_ID)
      );
      await wallet.sendTransaction(transaction2, connection);

      setStep(4);
      return keypair.publicKey.toBase58();
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  };

  const createToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setStep(0);

    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const symbol = formData.get('symbol') as string;
    const decimal = formData.get('decimal') as string;
    const supply = formData.get('supply') as string;
    const file = formData.get('file') as File;

    if (!name || !symbol || !decimal || !supply || !file) {
      setLoading(false);
      return;
    }

    try {
      const [imageURL, jsonURI]: [string, string] = await Promise.all([
        sendFileToIPFS(file),
        sendFileToIPFS(
          new File(
            [JSON.stringify({ name, symbol, decimal, supply, image: '' })],
            'metadata.json',
            { type: 'application/json' }
          )
        ),
      ]);

      const tokenAddress = await createTokenWithMetadata(
        { name, symbol, decimal, supply, image: imageURL },
        jsonURI
      );

      console.log('Token created successfully:', tokenAddress);
    } catch (error) {
      console.error('Error in token creation process:', error);
      setStep(-1);
      setTimeout(() => {
        setCongrats(true);
      }, 3000);
      setCongrats(false);
    } finally {
      form.reset();
      setLoading(false);
    }
  };

  return (
    <>
      {loading &&
        <dialog open className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm w-1/2 h-3/4 ">
          <div className=" text-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="animate-spin text-blue-400 w-20 h-20" />
              <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
            </div>
            <p className="text-lg font-semibold text-gray-100">{steps[step]}</p>
          </div>
        </dialog>
      }
      {congrats && (
        <dialog
          open
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm w-full h-screen"
        >
          <div className="bg-slate-800 text-white p-6 md:p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4 relative w-[90%] max-w-2xl">

            <Confetti
              width={700}
              height={600}
              recycle={false}
              numberOfPieces={600}
            />
            <button
              onClick={() => setCongrats(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ❌
            </button>
            <p className="text-2xl font-bold text-green-400">Congratulations! 🎉</p>
            <p className="text-lg text-gray-100 text-center">
              Your token has been successfully created!
            </p>
            <p className="text-sm text-gray-300 text-center italic">
              Go and check your wallet to see the minted token.
            </p>

          </div>
        </dialog>
      )}

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
            {loading ? "Creating. Hold On ! " : 'Create Token'}
          </button>
        </form>

      </div>
    </>

  );
}