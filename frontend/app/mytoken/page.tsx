"use client";
import React from "react";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

function MyToken() {
    const getAsset = async () => {
        try {
            const umi = createUmi(`https://devnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`).use(dasApi());
            const assetId = "EGXhsR5gVVNvzKUQ6Br9NDSodRbCFUNPtFLA5DDfsmdg"; 
            const asset = await umi.rpc.getAsset(publicKey(assetId));
            console.log(asset);
        } catch (error) {
            console.error("Error fetching asset:", error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-evenly my-14 text-white">
                <button onClick={getAsset} className="bg-blue-500 px-4 py-2 rounded-lg">
                    Get Asset
                </button>
            </div>
        </>
    );
}

export default MyToken;
