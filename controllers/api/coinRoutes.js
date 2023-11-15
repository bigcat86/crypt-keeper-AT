const router = require("express").Router();
const axios = require("axios");
const withAuth = require("../../utils/auth");
const coins = require("../../seeds/coin.json");
const { Coin } = require("../../models");

//get all coin data
router.get("/", withAuth, async (req, res) => {
  try {
    const coinData = await Coin.findAll();
    res.status(200).json(coinData);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update all coin prices (render not working)
router.put("/price", async (req, res) => {
  try {
    const coinsArray = [];

    for (const coin in coins) {
      coinsArray.push(coins[coin].coin_name);
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinsArray.join(
        "%2C"
      )}&vs_currencies=usd`,
      {
        params: {
          _limit: 1,
        },
      }
    );

    const priceObj = response.data;
    const coinPriceArr = [];

    for (const price in priceObj) {
      coinPriceArr.push([price, priceObj[price].usd]);
    }
    // console.log(coinPriceArr);

    if (coinPriceArr) {
      const coinData = await Coin.findAll();
      const plainCoinData = coinData.map((coin) => coin.get({ plain: true }));
      // console.log(plainCoinData);

      for (let i = 0; i < coinPriceArr.length; i++) {
        await Coin.update(
          { price: coinPriceArr[i][1] },
          { where: { coin_name: coinPriceArr[i][0] } }
        );
      }

      const updatedCoinData = await Coin.findAll();
      const newData = updatedCoinData.map((coin) => coin.get({ plain: true }));

      console.log(newData);
      res.status(200).json(newData);

    } else {
      res.status(404).json({ message: "Coins not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Get real-time price of a specific coin
router.get("/:id/price", withAuth, async (req, res) => {
  try {
    let coinsArray = [];

    for (const coin in coins) {
      coinsArray.push(coins[coin].coin_name);
    }
    // console.log(coinsArray);
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${
        coinsArray[req.params.id - 1]
      }&vs_currencies=usd`,
      {
        params: {
          _limit: 1,
        },
      }
    );
    console.log(response.data[coinsArray[req.params.id - 1]].usd);

    if (response.data[coinsArray[req.params.id - 1]].usd) {
      res.json(response.data[coinsArray[req.params.id - 1]].usd);
    } else {
      res.status(404).json({ message: "Coin not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
