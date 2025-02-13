// "use client";
// import React, { useState } from "react";
// import { dasApi, DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { publicKey } from "@metaplex-foundation/umi";
// import { Connection, PublicKey } from "@solana/web3.js";

// const RPC_URL = `https://devnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

// function MyToken() {
//     const [balance, setBalance] = useState<number | null>(null);
//     const [metadata, setMetadata] = useState<DasApiAsset | null>(null);

//     const getSolanaData = async () => {
//         try {
//             const connection = new Connection(RPC_URL);
//             const walletAddress = "EGXhsR5gVVNvzKUQ6Br9NDSodRbCFUNPtFLA5DDfsmdg"; 
//             const solBalance = await connection.getBalance(new PublicKey(walletAddress));
//             setBalance(solBalance / 1e9);            
//             const umi = createUmi(RPC_URL).use(dasApi());
//             const assetId = publicKey(walletAddress);
//             const asset: DasApiAsset = await umi.rpc.getAsset(assetId);
//             setMetadata(asset);             
//             console.log("SOL Balance:", solBalance / 1e9);
//             console.log("Metadata:", asset);
//         } catch (error) {
//             console.error("Error fetching data:", error);
//         }
//     };

//     return (
//         <>
//             <div className="flex items-center justify-evenly my-14 text-white">
//                 <button onClick={getSolanaData} className="bg-blue-500 px-4 py-2 rounded-lg">
//                     Get SOL Balance & Metadata
//                 </button>
//             </div>
//             {balance !== null && <p>SOL Balance: {balance} SOL</p>}
//             {metadata && <pre>{JSON.stringify(metadata, null, 2)}</pre>}
//         </>
//     );
// }

// export default MyToken;
