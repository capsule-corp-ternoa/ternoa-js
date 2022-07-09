// Exercise Name: Simple NFT Viewer
// Date : 2022-07-06
// Keywords: Create-Collection Create-NFT Create-Marketplace Batch-All List-NFT Buy-NFT Dummy-Data
// Author: Charmander

import { initializeApi } from '../../../src/blockchain/index';
import { getNextNftId, getNftData } from '../../../src/nft';
import epxress from 'express'
import cors from 'cors'
import fetch from 'node-fetch';

interface NFT {
    nftId: number;
    imageUrl: string;
    title: string;
    description: string;
}

class Cache {
    nfts: Map<number, NFT>;

    constructor() {
        this.nfts = new Map();
    }

    addRecord(nftId: number, imageUrl: string, title: string, description: string) {
        this.nfts.set(nftId, { nftId, imageUrl, title, description });
    }

    getRecord(nftId: number): NFT | undefined {
        return this.nfts.get(nftId);
    }
}

let CACHE = new Cache();

async function main() {
    // Initializing Blockchain API
    await initializeApi("wss://mainnet.ternoa.network");
    console.log("Api Init");


    // Create the API server
    const app = epxress();

    app.use(cors({
        origin: "*"
    }));

    // Defining the root
    app.get('/', (req, res) => {
        res.send('hello world')
    })

    // Defining the root
    app.get('/nft', async (req, res) => {
        let a = await fetchNewNftImage();
        res.send(a)
    })

    console.log("Starting to listen...");
    app.listen(3000);
}

main();


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function fetchNewNftImage(): Promise<string> {
    let maxNftId = await getNextNftId();
    let nftId = 0;


    while (true) {
        nftId = getRandomInt(0, maxNftId);
        console.log("New nft: " + nftId);
        console.log("Checking cache...");

        const maybe_record = CACHE.getRecord(nftId);
        if (maybe_record != undefined) {
            console.log("Cache HIT!");
            console.log(maybe_record);

            return JSON.stringify(maybe_record);
        }
        console.log("Cache MISS!");


        let data = await getNftData(nftId);
        if (data == undefined) {
            continue;
        };

        const url = "https://ipfs.ternoa.dev/ipfs/" + data.offchainData;
        let metadata: any = "";
        try {
            console.log("Getting metadata: " + url);
            let response = await fetch(url);
            let json = await response.text();
            metadata = JSON.parse(json);
        } catch (error: any) {
            console.log("Not an IPFS Valid Image Link ");
            continue;
        }

        if (metadata.properties == undefined || metadata.properties.media == undefined) {
            console.log("Found broken NFT1");
            continue;
        }

        let url2 = "https://ipfs.ternoa.dev/ipfs/";
        if (metadata.properties.media.url != undefined) {
            url2 += metadata.properties.media.url;
        } else if (metadata.properties.media.hash != undefined) {
            url2 += metadata.properties.media.hash;
        } else {
            console.log("Found broken NFT2");
            continue;
        }
        try {
            console.log("Getting image: " + url);
            await fetch(url2);
        } catch (error: any) {
            console.log("Not an IPFS Valid Image Link ");
        }

        CACHE.addRecord(nftId, url2, metadata.title, metadata.description);

        return JSON.stringify(CACHE.getRecord(nftId));
    }
}