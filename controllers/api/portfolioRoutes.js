const axios = require("axios");
const router = require("express").Router();
require("dotenv").config();
const { Portfolio, User, Coin, PortfolioCoin } = require("../../models");
const withAuth = require("../../utils/auth");
const { where } = require("sequelize");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
// Get user's portfolio with associted coins
router.get("/:id", async (req, res) => {
  try {
    // console.log(req.session.user_id);
    const portfolioData = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User }, { model: Coin }],
    });

    res.status(200).json(portfolioData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/deposit", withAuth, async (req, res) => {
  try {
    const portfolioData = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User }, { model: Coin }],
    });
    const portfolio = portfolioData[0].get({ plain: true });
    // console.log(req.body.deposit);

    const deposit = req.body.deposit;
    const newBalance = Number(portfolio.value) + deposit;

    console.log(newBalance);

    const newPortfolio = await Portfolio.update(
      { value: newBalance },
      { where: { user_id: req.session.user_id } }
    );
    // console.log(newPortfolio);

    // const portfolioCoin = await PortfolioCoin.create(
    //   { quantity: quantity + deposit, 
    //     coin_id: 1,
    //     portfolio_id: portfolio.id
    //   }
    // );
    // console.log(portfolioCoin);
    res.status(200).json({ message: `Deposit successful, new balance is ${newBalance}` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add a coin to user's portfolio
router.post("/coin", withAuth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User }, { model: Coin }],
    });

    const coin = await Coin.findOne({
      where: { coin_name: req.body.coin_name },
    });

    const newCoin = {
      coin_name: req.body.coin_name,
      price: coin.price,
      quantity: req.body.quantity,
    };
    const portfolioId = portfolio[0].id;
    console.log(newCoin);

    let exists = portfolio[0].coins.filter(
      (coin) => coin.coin_name === newCoin.coin_name
    );

    if (exists[0]) {
      res.json({ message: `Coin ${newCoin.coin_name} already exists` });
    } else {
      await PortfolioCoin.create({
        quantity: newCoin.quantity,
        coin_id: coin.id,
        portfolio_id: portfolioId,
      });
      res
        .status(200)
        .json({ message: `Coin ${newCoin.coin_name} added successfully!` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a coin from user's portfolio
router.delete("/coin", withAuth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User }, { model: Coin }],
    });

    const coin = await Coin.findOne({
      where: { coin_name: req.body.coin_name },
    });

    const deleteCoin = req.body;
    let exists = portfolio[0].coins.filter(
      (coin) => coin.coin_name === deleteCoin.coin_name
    );
    const removeCoin = exists[0];
    console.log(coin.id);
    if (removeCoin.coin_name === deleteCoin.coin_name) {
      await portfolio[0].removeCoin(removeCoin);
      await PortfolioCoin.destroy({
        where: {
          coin_id: coin.id,
        },
      });
      res
        .status(200)
        .json({ message: `${deleteCoin.coin_name} deleted from portfolio` });
    } else {
      res
        .status(200)
        .json({ message: `${deleteCoin.coin_name} not found in portfolio` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id/gpt", withAuth, async (req, res) => {
  try {
    const portfolioData = await Portfolio.findAll({
      where: { user_id: req.session.user_id },
      include: [{ model: User }, { model: Coin }],
    });

    const portfolio = portfolioData[0].coins.map((coin) =>
      coin.get({ plain: true })
    );
    
    let coins = [];
    portfolio.forEach((coin) => {
      if (coin.coin_name !== "usd") {
        coins.push(coin.coin_name);
      }
    });
    console.log(coins);

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `My cryptocurrency portfolio holds ${coins}. As of the year 2023, give me predictions for the coins in my portfolio and recent news for each coin. Finally, suggest one cryptocurrency that is worth researching more about. Please format your response in neat html, using <h3> for the headers of each section, breaks after each section, and with no html head.`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const gptScript = chatCompletion.choices[0].message.content
    res.status(200).json(gptScript);
  } catch (error) {
    console.log(error);
  }
});

// Sell a coin from user's portfolio
// router.post('/:id/sell', withAuth, async (req, res) => {
//   try {
//     const { coin_name, quantity } = req.body;
//     const portfolio = await Portfolio.findOne({ where: { user_id: req.params.id } });
//     if (!portfolio) {
//       return res.status(404).json({ error: 'Portfolio not found' });
//     }
//     const coinIndex = portfolio.coins.findIndex(c => c.coin_name === coin_name);
//     if (coinIndex === -1) {
//       return res.status(404).json({ error: 'Coin not found in portfolio' });
//     }
//     if (portfolio.coins[coinIndex].quantity < quantity) {
//       return res.status(400).json({ error: 'Not enough coins to sell' });
//     }
//     portfolio.coins[coinIndex].quantity -= quantity;
//     if (portfolio.coins[coinIndex].quantity === 0) {
//       portfolio.coins.splice(coinIndex, 1);
//     }
//     await portfolio.save();
//     res.json(portfolio);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
