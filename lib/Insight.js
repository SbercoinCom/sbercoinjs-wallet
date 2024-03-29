"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insight = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const INSIGHT_BASEURLS = {
    [constants_1.NetworkNames.MAINNET]: "https://explorer.sbercoin.com/api",
    [constants_1.NetworkNames.TESTNET]: "https://testnet.sbercoin.com/insight-api",
    [constants_1.NetworkNames.REGTEST]: "http://localhost:3001/insight-api",
};
class Insight {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.axios = axios_1.default.create({
            baseURL,
        });
    }
    // public static mainnet(): Insight {
    //   return new Insight(MAINNET_API_BASEURL)
    // }
    // public static testnet(): Insight {
    //   return new Insight(TESTNET_API_BASEURL)
    // }
    static forNetwork(network) {
        const baseURL = INSIGHT_BASEURLS[network.name];
        if (baseURL == null) {
            throw new Error(`No Insight API defined for network: ${network.name}`);
        }
        return new Insight(baseURL);
    }
    listUTXOs(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.axios.get(`/address/${address}/utxo`);
            return res.data;
        });
    }
    getInfo(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.axios.get(`/address/${address}`);
            return res.data;
        });
    }
    sendRawTx(rawtx) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.axios.post('/tx/send', {
                rawtx,
            }).then((response) => {
                return response.data;
            });
            return res;
        });
    }
    contractCall(address, encodedData, sender //hexAddress
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME wow, what a weird API design... maybe we should just host the RPC
            // server, with limited API exposed.
            if (sender.length != 40)
                sender = '0000000000000000000000000000000000000000';
            const res = yield this.axios.get(`/contract/${address}/call?data=${encodedData}&sender=${sender}`);
            return res.data;
        });
    }
    /**
     * Estimate the fee per KB of txdata, in greph. Returns -1 if no estimate is
     * available. It always return -1 for testnet.
     *
     * @param nblocks
     */
    estimateFee(nblocks = 6) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.axios.get('/info').then(function (response) {
                return response.data.feeRate;
            });
            const feeRate = res;
            if (typeof feeRate !== "number" || feeRate < 0) {
                return -1;
            }
            return Math.ceil(feeRate * 1e7);
        });
    }
    /**
     * Estimate the fee per byte of txdata, in greph. Returns -1 if no estimate is
     * available. It always return -1 for testnet.
     *
     * @param nblocks
     */
    estimateFeePerByte(nblocks = 6) {
        return __awaiter(this, void 0, void 0, function* () {
            const feeRate = yield this.estimateFee();
            if (feeRate < 0) {
                return feeRate;
            }
            return Math.ceil(feeRate / 1024);
        });
    }
    /**
     * Get single transaction's info
     * @param id
     */
    getTransactionInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.axios.get(`/tx/${id}`);
            return res.data;
        });
    }
    /**
     * Get multiple Transaction info (paginated)
     * @param address
     * @param pageNum
     */
    getTransactions(address, pageNum = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.axios.get(`/address/${address}/basic-txs?pageSize=10&page=${pageNum}`);
            return result.data;
        });
    }
}
exports.Insight = Insight;
//# sourceMappingURL=Insight.js.map