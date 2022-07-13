import { NFT } from ".";
import fs from 'fs';

const DB_FILENAME: string = "db.json";

export class Cache {
    nfts: Map<number, NFT>;

    constructor() {
        this.nfts = new Map();
    }

    addRecord(nft: NFT) {
        this.nfts.set(nft.nftId, nft);
    }

    getRecord(nftId: number): NFT | undefined {
        return this.nfts.get(nftId);
    }

    loadRecords() {
        if (!fs.existsSync(DB_FILENAME)) {
            return;
        }

        let buffer = fs.readFileSync(DB_FILENAME);
        let nfts: NFT[] = JSON.parse(buffer.toString());
        for (let nft of nfts) {
            this.nfts.set(nft.nftId, nft);
        }
    }

    saveRecords() {
        let nfts: NFT[] = [];
        for (let nft of this.nfts.values()) {
            nfts.push(nft);
        }

        fs.writeFileSync(DB_FILENAME, JSON.stringify(nfts, null, 2));
    }
}