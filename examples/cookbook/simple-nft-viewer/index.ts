// Exercise Name: Simple NFT Viewer
// Date : 2022-07-06
// Keywords: Create-Collection Create-NFT Create-Marketplace Batch-All List-NFT Buy-NFT Dummy-Data
// Author: Charmander

import { initializeApi } from '../../../src/blockchain/index';
import { getNextNftId, getNftData, INftData } from '../../../src/nft';
import { Cache } from './cache';
import epxress from 'express'
import cors from 'cors'
import fetch from 'node-fetch';

export interface NFT {
    nftId: number;
    imageUrl: string;
    title: string;
    description: string;
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

    CACHE.loadRecords();

    console.log("Starting to listen...");
    app.listen(3000);
}

main();


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function getNFTMetadata(nft: INftData): Promise<any> {
    try {
        const url = "https://ipfs.ternoa.dev/ipfs/" + nft.offchainData;
        console.log("Getting metadata: " + url);

        let response = await fetch(url);
        let json = await response.text();
        return JSON.parse(json);
    } catch (error: any) {
        return undefined;
    }
}

async function getImageUrl(metadata: any): Promise<string | undefined> {
    if (metadata.properties == undefined || metadata.properties.media == undefined) {
        return undefined;
    }

    let url = "https://ipfs.ternoa.dev/ipfs/";
    if (metadata.properties.media.url != undefined) {
        url += metadata.properties.media.url;
    } else if (metadata.properties.media.hash != undefined) {
        url += metadata.properties.media.hash;
    } else {
        return undefined;
    }

    try {
        console.log("Getting image: " + url);
        await fetch(url);
    } catch (error: any) {
        return undefined;
    }

    return url
}

async function fetchNewNftImage(): Promise<string> {
    let maxNftId = await getNextNftId();
    let nftId = 0;

    while (true) {
        nftId = getRandomInt(0, maxNftId - 1);
        console.log("New nft: " + nftId);
        console.log("Checking cache...");

        const record = CACHE.getRecord(nftId);
        if (record != undefined) {
            console.log("Cache HIT!");
            console.log(record);

            return JSON.stringify(record);
        }
        console.log("Cache MISS!");


        let nft = await getNftData(nftId);
        if (nft == undefined) {
            console.log("Failed to get NFT data from blockchain");
            continue;
        };

        const metadata = await getNFTMetadata(nft);
        if (metadata == undefined) {
            console.log("Failed to get NFT metadata");
            continue;
        }

        const imageUrl = await getImageUrl(metadata);
        if (imageUrl == undefined) {
            console.log("Failed to get image from Metadata");
            continue;
        }

        const nftRecord: NFT = { nftId, imageUrl, title: metadata.title, description: metadata.description };
        CACHE.addRecord(nftRecord);
        CACHE.saveRecords();

        console.log("Done!");
        return JSON.stringify(nftRecord);
    }
}