import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js"
import {
    getMint,
    TOKEN_PROGRAM_ID,
    ACCOUNT_SIZE,
    createInitializeAccountInstruction,
    NATIVE_MINT,
} from "@solana/spl-token"
import BN from "bn.js"
import { DexInstructions, Market } from "@project-serum/serum"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { raydiumProgramId } from "./constant";
import { execTx } from "./util";

const EVENT_QUEUE_LENGTH = 2978;
const EVENT_SIZE = 88;
const EVENT_QUEUE_HEADER_SIZE = 32;

const REQUEST_QUEUE_LENGTH = 63;
const REQUEST_SIZE = 80;
const REQUEST_QUEUE_HEADER_SIZE = 32;

const ORDERBOOK_LENGTH = 909;
const ORDERBOOK_NODE_SIZE = 72;
const ORDERBOOK_HEADER_SIZE = 40;
const LOT_SIZE = -3;
const TICK_SIZE = 8;

export function calculateTotalAccountSize(
    individualAccountSize: number,
    accountHeaderSize: number,
    length: number
) {
    const accountPadding = 12;
    const minRequiredSize =
        accountPadding + accountHeaderSize + length * individualAccountSize;

    const modulo = minRequiredSize % 8;

    return modulo <= 4
        ? minRequiredSize + (4 - modulo)
        : minRequiredSize + (8 - modulo + 4);
};

const TOTAL_EVENT_QUEUE_SIZE = calculateTotalAccountSize(
    128,
    EVENT_QUEUE_HEADER_SIZE,
    EVENT_SIZE
);

const TOTAL_REQUEST_QUEUE_SIZE = calculateTotalAccountSize(
    10,
    REQUEST_QUEUE_HEADER_SIZE,
    REQUEST_SIZE
);

const TOTAL_ORDER_BOOK_SIZE = calculateTotalAccountSize(
    201,
    ORDERBOOK_HEADER_SIZE,
    ORDERBOOK_NODE_SIZE
);

const getVaultNonce = async (market: PublicKey, programId: PublicKey) => {
    let i = 0
    let result = null
    while (true) {
        result =
            await getVaultOwnerAndNonce(
                market,
                programId,
                i
            );
        if (result)
            return result;
        else
            i++;
    }
}


export async function getVaultOwnerAndNonce(
    marketAddress: PublicKey,
    dexAddress: PublicKey,
    seedNum: number
): Promise<[vaultOwner: PublicKey, nonce: BN] | undefined> {
    let nonce = new BN(seedNum);
    console.log("nonce:", nonce);
    try {
        console.log("market address: ", marketAddress.toBase58());
        console.log("dex address: ", dexAddress.toBase58());

        const vaultOwner = PublicKey.createProgramAddressSync(
            [marketAddress.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
            dexAddress
        );
        console.log("vault owner ", vaultOwner.toBase58());
        return [vaultOwner, nonce];
    } catch (e) {
        console.log('error here');
    }
}


export const createMarket = async (
    wallet: NodeWallet,
    baseMintAddress: PublicKey,

    connection: Connection
) => {
    try {
        let baseMint: PublicKey
        let baseMintDecimals: number
        let quoteMint: PublicKey
        let quoteMintDecimals: number
        const vaultInstructions: TransactionInstruction[] = []
        const marketInstructions: TransactionInstruction[] = []

        try {
            const baseMintInfo = await getMint(connection, baseMintAddress);
            baseMint = baseMintInfo.address;
            baseMintDecimals = baseMintInfo.decimals;

            const quoteMintInfo = await getMint(connection, NATIVE_MINT);
            quoteMint = quoteMintInfo.address;
            quoteMintDecimals = quoteMintInfo.decimals;
        } catch (e) {
            console.error("Invalid mints provided.", e);
            return;
        }

        const timeOut = setTimeout(async () => {
            console.log("Trying market creation again");
            const marketId = await createMarket(wallet, baseMintAddress, connection);
            return marketId;
        }, 20000);

        const marketAccounts = {
            market: Keypair.generate(),
            requestQueue: Keypair.generate(),
            eventQueue: Keypair.generate(),
            bids: Keypair.generate(),
            asks: Keypair.generate(),
            baseVault: Keypair.generate(),
            quoteVault: Keypair.generate(),
        }
        const [vaultOwner, vaultOwnerNonce] = await getVaultNonce(
            marketAccounts.market.publicKey,
            raydiumProgramId.OPENBOOK_MARKET
        );

        // create vaults
        vaultInstructions.push(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: marketAccounts.baseVault.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    ACCOUNT_SIZE
                ),
                space: ACCOUNT_SIZE,
                programId: TOKEN_PROGRAM_ID,
            }),
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: marketAccounts.quoteVault.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    ACCOUNT_SIZE
                ),
                space: ACCOUNT_SIZE,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeAccountInstruction(
                marketAccounts.baseVault.publicKey,
                baseMint,
                vaultOwner
            ),
            createInitializeAccountInstruction(
                marketAccounts.quoteVault.publicKey,
                quoteMint,
                vaultOwner
            )
        );

        clearTimeout(timeOut);
        // tickSize and lotSize here are the 1e^(-x) values, so no check for ><= 0
        const baseLotSize = Math.round(
            10 ** baseMintDecimals * Math.pow(10, -1 * LOT_SIZE)
        );
        const quoteLotSize = Math.round(
            10 ** quoteMintDecimals *
            Math.pow(10, -1 * LOT_SIZE) *
            Math.pow(10, -1 * TICK_SIZE)
        );
        // create market account
        marketInstructions.push(
            SystemProgram.createAccount({
                newAccountPubkey: marketAccounts.market.publicKey,
                fromPubkey: wallet.publicKey,
                space: Market.getLayout(raydiumProgramId.OPENBOOK_MARKET).span,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    Market.getLayout(raydiumProgramId.OPENBOOK_MARKET).span
                ),
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );

        // create request queue
        marketInstructions.push(
            SystemProgram.createAccount({
                newAccountPubkey: marketAccounts.requestQueue.publicKey,
                fromPubkey: wallet.publicKey,
                space: TOTAL_REQUEST_QUEUE_SIZE,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    TOTAL_REQUEST_QUEUE_SIZE
                ),
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );

        // create event queue
        marketInstructions.push(
            SystemProgram.createAccount({
                newAccountPubkey: marketAccounts.eventQueue.publicKey,
                fromPubkey: wallet.publicKey,
                space: TOTAL_EVENT_QUEUE_SIZE,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    TOTAL_EVENT_QUEUE_SIZE
                ),
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );

        const orderBookRentExempt =
            await connection.getMinimumBalanceForRentExemption(TOTAL_ORDER_BOOK_SIZE);

        // create bids
        marketInstructions.push(
            SystemProgram.createAccount({
                newAccountPubkey: marketAccounts.bids.publicKey,
                fromPubkey: wallet.publicKey,
                space: TOTAL_ORDER_BOOK_SIZE,
                lamports: orderBookRentExempt,
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );

        // create asks
        marketInstructions.push(
            SystemProgram.createAccount({
                newAccountPubkey: marketAccounts.asks.publicKey,
                fromPubkey: wallet.publicKey,
                space: TOTAL_ORDER_BOOK_SIZE,
                lamports: orderBookRentExempt,
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );

        marketInstructions.push(
            DexInstructions.initializeMarket({
                market: marketAccounts.market.publicKey,
                requestQueue: marketAccounts.requestQueue.publicKey,
                eventQueue: marketAccounts.eventQueue.publicKey,
                bids: marketAccounts.bids.publicKey,
                asks: marketAccounts.asks.publicKey,
                baseVault: marketAccounts.baseVault.publicKey,
                quoteVault: marketAccounts.quoteVault.publicKey,
                baseMint,
                quoteMint,
                baseLotSize: new BN(baseLotSize),
                quoteLotSize: new BN(quoteLotSize),
                feeRateBps: 150, // Unused in v3
                quoteDustThreshold: new BN(500), // Unused in v3
                vaultSignerNonce: vaultOwnerNonce,
                programId: raydiumProgramId.OPENBOOK_MARKET,
            })
        );
        console.log("Transactions for market creation is ready, sending transactions");
        try {
            let blockhash = (await connection.getLatestBlockhash("confirmed"));

            const createVaultTx = new Transaction().add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 60_000,
                }),
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: 200_000,
                }),
                ...vaultInstructions
            );
            createVaultTx.recentBlockhash = blockhash.blockhash;
            createVaultTx.feePayer = wallet.publicKey;
            createVaultTx.sign(
                marketAccounts.baseVault,
                marketAccounts.quoteVault
            );

            const createMarketTx = new Transaction().add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 60_000,
                }),
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: 200_000,
                }),
                ...marketInstructions
            );
            createMarketTx.recentBlockhash = blockhash.blockhash;
            createMarketTx.feePayer = wallet.publicKey;
            createMarketTx.sign(
                marketAccounts.market,
                marketAccounts.requestQueue,
                marketAccounts.eventQueue,
                marketAccounts.bids,
                marketAccounts.asks
            );

            await execTx(createVaultTx, connection, wallet, "finalized");
            await execTx(createMarketTx, connection, wallet, "finalized");

            return marketAccounts.market.publicKey;
        } catch (error) {
            console.error("Error creating market: ", error);
            return;
        }
    } catch (error) {
        console.error("Error creating market: ", error);
        return;
    }
}
