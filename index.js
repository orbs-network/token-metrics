const Web3 = require("web3");
const ETHEREUM_ENDPOINT = process.env.ETHEREUM_ENDPOINT;
const PORT = process.env.PORT || 3000;

const { tokensInCirculation } = require("./token");

const web3 = new Web3(ETHEREUM_ENDPOINT);
let supply;

async function updateSupply() {
    try {
        supply = await tokensInCirculation(web3);
    } catch (e) {
        console.log(e);
    }
};

updateSupply();
setInterval(updateSupply, 1*60000); // every minute

const app = require("express")();

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        description: "ORBS blockchain token metrics",
    });
});

app.get("/supply", (req, res) => {
    if (!supply) {
        res.status(503);
        return res.json({
            status: "temporarily unavailable",
        });
    }

    res.json(supply);
});

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`)
});