const ADDRESS = "0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa";
const ABI = require("./abi.json");

const LONG_TERM_RESERVES = "0x384f5cf955b39b76c47a440f14c31ad39fd39d00";
const PRIVATE_SALE = "0x1bef7f8798256e033eaa42f005d2b53079b90ffe";
const TEAM_AND_FOUNDING_PARTNERS = "0xc200f98f3c088b868d80d8eb0aeb9d7ee18d604b";
const ADVISORS = "0x574d48b2ec0a5e968adb77636656672327402634";

function getContract(web3) {
    return new web3.eth.Contract(ABI, ADDRESS);
}

async function tokensInCirculation(web3) {
    const contract = getContract(web3);
    const block = await web3.eth.getBlockNumber();
    const updatedAt = new Date();
    
    const totalSupply = BigInt(await contract.methods.totalSupply().call(block));

    const values = (await Promise.all([LONG_TERM_RESERVES, PRIVATE_SALE, TEAM_AND_FOUNDING_PARTNERS, ADVISORS].map(address => {
        return contract.methods.balanceOf(address).call(block);
    }))).map(BigInt);

    const supplyInCirculation = values.reduce((previousValue, currentValue) => {
        return previousValue - currentValue;
    }, totalSupply);

    return {
        supplyInCirculation: supplyInCirculation.toString(),
        totalSupply: totalSupply.toString(),
        block,
        updatedAt,
    }
}

module.exports = {
    tokensInCirculation,
}