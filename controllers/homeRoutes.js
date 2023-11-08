const router = require('express').Router();
const {User, Portfolio, Coin, PortfolioCoin} = require('../models');
const { Configuration, OpenAIApi } = require("openai");
const coins = require('../seeds/coin.json');
require('dotenv').config();
const withAuth = require('../utils/auth');

router.get('/', withAuth, async (req, res) => {
  try {

    const portfolioData = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
        include: [
        { model: User, attributes: ['user_name'] },
        { model: Coin }
      ],
    });
    // console.log(portfolioData);
    const portfolioCoinData = await PortfolioCoin.findAll({
        where: { portfolio_id: req.session.user_id }
    });
    const portfolioCoin = portfolioCoinData.map((portcoin) => portcoin.get({ plain: true }))
    
    let quantities = [];
    portfolioCoin.forEach(coin => quantities.push(coin.quantity));
    // console.log(quantities);

    const portfolio = portfolioData.map((portfolio) => portfolio.get({ plain: true }));
    let portCoins = [];
    portfolio[0].coins.forEach(coin => portCoins.push(coin.coin_name));

    // console.log(portfolio[0].portfolio_coin[0]);

    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${portCoins.join('%2C')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`)
    const data = await response.json();
    const dataArr = Object.entries(data)
    const coinArr = dataArr.map(coin => coin[0])
    // console.log(coinArr);
    console.log(dataArr);

    const coinsArray = [];

    for (const coin in coins) {
      coinsArray.push([coins[coin].coin_name, coins[coin].price]);
    }

    let prices = [];
    dataArr.forEach(coin => prices.push(coin[1].usd))
    // console.log(prices);
    // console.log(quantities);

    res.render('dashboard', {
      ...portfolio[0], 
      coinsArray, 
      coinArr, 
      dataArr, 
      quantities,
      prices,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route for login page
router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/');
        return;
    }
    res.render('landing');
});

//added for push

module.exports = router;