const router = require("express").Router();
const { User, Portfolio, Coin, PortfolioCoin } = require("../models");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const withAuth = require("../utils/auth");
const geckoKey = process.env.GECKO_API_KEY;

router.get("/", withAuth, async (req, res) => {
  try {

    const coinData = await Coin.findAll();
    const currentCoins = coinData.map((coin) => coin.get({ plain: true }));

    const portfolioData = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User, attributes: ["user_name"] }, { model: Coin }],
    });

    const portfolio = portfolioData.map((portfolio) =>
      portfolio.get({ plain: true })
    );

    const portfolioCoinData = await PortfolioCoin.findAll({
      where: { portfolio_id: req.session.user_id },
    });
    const portfolioCoin = portfolioCoinData.map((portcoin) =>
      portcoin.get({ plain: true })
    );

    let quantities = [];
    portfolioCoin.forEach((coin) => quantities.push(coin.quantity));

    let portCoins = [];
    portfolio[0].coins.forEach((coin) => {
      if (coin.coin_name !== "usd") {
        portCoins.push(coin.coin_name);
      }
    });

    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${portCoins.join('%2C')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&x-cg-demo-api-key=${geckoKey}`);
    const data = await response.json();
    const dataArr = Object.entries(data);

    let prices = [];
    portfolioCoin.forEach((coin) => {
      currentCoins.forEach((currentCoin) => {
        if (coin.coin_id === currentCoin.id) {
          prices.push(currentCoin.price);
        }
      });
    });

    const usd = {
      price: 1,
      quantity: portfolio[0].value,
    }

    console.log(usd.quantity);

    res.render("dashboard", {
      ...portfolio[0],
      usd,
      currentCoins,
      portCoins,
      dataArr,
      quantities,
      prices,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    console.log(`ERROR ERRROR ERROR, THIS IS AN ERROR ${err}`);
    res.status(500).json(err);
  }
});

// GET route for login page
router.get("/login", (req, res) => {
  try {
    if (req.session.logged_in) {
      res.redirect("/");
    }
    res.render("landing");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
