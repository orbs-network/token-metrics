const ERC20_CONTRACT_ADDRESS = "0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa";
const STAKING_ADDRESS = "0x01D59Af68E2dcb44e04C50e05F62E7043F2656C3";

const ERC20_ABI = require("./token.abi.json");
const STAKING_ABI = require("./staking.abi.json");

const LONG_TERM_RESERVES = "0x384f5cf955b39b76c47a440f14c31ad39fd39d00";
const PRIVATE_SALE = "0x1bef7f8798256e033eaa42f005d2b53079b90ffe";
const TEAM_AND_FOUNDING_PARTNERS = "0xc200f98f3c088b868d80d8eb0aeb9d7ee18d604b";
const ADVISORS = "0x574d48b2ec0a5e968adb77636656672327402634";

const NON_CIRCULATING_WALLETS = [LONG_TERM_RESERVES, PRIVATE_SALE, TEAM_AND_FOUNDING_PARTNERS, ADVISORS];

function getERC20Contract(web3) {
    return new web3.eth.Contract(ERC20_ABI, ERC20_CONTRACT_ADDRESS);
}

function getStakingContract(web3) {
    return new web3.eth.Contract(STAKING_ABI, STAKING_ADDRESS);
}

function sum(list) {
    return list.reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
    }, BigInt(0));
}

async function tokensInCirculation(web3) {
    const erc20 = getERC20Contract(web3);
    const staking = getStakingContract(web3);

    const block = await web3.eth.getBlockNumber();
    const { timestamp } = await web3.eth.getBlock(block);
    const updatedAt = new Date(timestamp * 1000);
    
    const totalSupply = BigInt(await erc20.methods.totalSupply().call(block));
    const decimals = BigInt(await erc20.methods.decimals().call(block));

    const nonCirculatingWalletValues = (await Promise.all(NON_CIRCULATING_WALLETS.map(address => {
        return erc20.methods.balanceOf(address).call(block);
    }))).map(BigInt);

    const stakedNonCirculatingWalletValues = (await Promise.all(NON_CIRCULATING_WALLETS.map(address => {
        return staking.methods.getStakeBalanceOf(address).call(block);
    }))).map(BigInt);

    const supplyInCirculation = totalSupply - sum(nonCirculatingWalletValues) - sum(stakedNonCirculatingWalletValues);

    return {
        contract: ERC20_CONTRACT_ADDRESS,
        stakingContract: STAKING_ADDRESS,
        nonCirculatingWallets: NON_CIRCULATING_WALLETS,
        supplyInCirculation: supplyInCirculation.toString(),
        totalSupply: totalSupply.toString(),
        decimals: decimals.toString(),
        block,
        blockTimestamp: timestamp,
        updatedAt,
    }
}

module.exports = {
    tokensInCirculation,
}