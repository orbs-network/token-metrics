const Web3 = require("web3");
const ETHEREUM_ENDPOINT = process.env.ETHEREUM_ENDPOINT;

const { tokensInCirculation } = require("./token");

if (!module.parent) {
    const web3 = new Web3(ETHEREUM_ENDPOINT);

    (async () => {
        try {
            console.log(await tokensInCirculation(web3));
        } catch (e) {
            console.error(e);
        }
    })();
}