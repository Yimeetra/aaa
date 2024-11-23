import express from "express";
import cors from "cors";
import axios from "axios";
import jsdom from 'jsdom';

const app = express();
const port = 3001;

app.use(cors());// Разрешаем CORS

const tonViewerUrl = "https://tonviewer.com/EQAWVv2x6txoc5Nel9CltbfYSBMOOf0R9sb7GnqY-4ncmjcQ";

async function get_assets() {
  const response = await axios.post(
    "https://api.dedust.io/v3/graphql",
    {
      query: "query GetAssets {assets {type address name symbol price decimals}}",
      operationName: "GetAssets"
    },
    {
      headers: {
        "content-type": "application/json"
      }
    }
  )

  return response.data.data.assets
}

async function get_boosts() {
  const response = await axios.post(
    "https://api.dedust.io/v3/graphql",
    {
      query: "query GetBoosts {boosts {asset budget liquidityPool rewardPerDay startAt endAt}}",
      operationName: "GetBoosts"
    },
    {
      headers: {
        "content-type": "application/json"
      }
    }
  )

  return response.data.data.boosts
}

async function get_pools() {
  const response = await axios.post(
    "https://api.dedust.io/v3/graphql",
    {
      query: "query GetPools {pools {address totalSupply type tradeFee assets reserves fees volume}}",
      operationName: "GetPools"
    },
    {
      headers: {
        "content-type": "application/json"
      }
    }
  )

  return response.data.data.pools
}

function calc_apr(tvl, fees, reward_per_day) {
    let apr = fees * 365 / tvl * 100 * 0.8
        apr += reward_per_day * 365 / tvl * 100
    return apr
}

function calc_fees(volume, trade_fee) {
    return volume * (trade_fee / 100)
}

function calc_tvl(reserves1, reserves2) {
    return reserves1 + reserves2
}

function calc_volume(volume, price) {
    return volume/10**9 * price
}

async function getPoolData() {
  const assets = await get_assets();
  const pools = await get_pools();
  const boosts = await get_boosts();

  let poolNames = [];
  let poolTpr = [];
  let poolHref = [];

  const HOLY_asset = assets.find((asset) => {
    return asset.symbol === "HOLY"
  })

  const HOLY_pools = pools.filter((pool) => {
    return pool.assets.includes(`${HOLY_asset.type}:${HOLY_asset.address}`)
  })

  HOLY_pools.forEach(pool => {
    let first_token_address = pool.assets[0].replace(/\w+:/, "")
    let second_token_address = pool.assets[1].replace(/\w+:/, "")

    let first_token_asset
    if (first_token_address === "native") {
      first_token_asset = assets.find((asset) => {
        return asset.symbol === "TON"
      })
    } else {
      first_token_asset = assets.find((asset) => {
        return asset.address === first_token_address
      })
    }

    let second_token_asset
    if (second_token_address === "native") {
      second_token_asset = assets.find((asset) => {
        return asset.symbol === "TON"
      })
    } else {
      second_token_asset = assets.find((asset) => {
        return asset.address === second_token_address
      })
    }

    let reward_per_day = boosts.filter((boost) => {
      return boost.asset === `${HOLY_asset.type}:${HOLY_asset.address}` && boost.liquidityPool === pool.address && Date.parse(boost.startAt) < Date.now()
    }).reduce((sum, boost) => sum+boost.rewardPerDay/10**HOLY_asset.decimals*HOLY_asset.price, 0)

    let tvl = calc_tvl(pool.reserves[0]/(10**first_token_asset.decimals)*first_token_asset.price,
                       pool.reserves[1]/(10**second_token_asset.decimals)*second_token_asset.price)
    let volume = calc_volume(pool.volume[0], first_token_asset.price)
    let fees = calc_fees(volume, pool.tradeFee)
    let tpr = calc_apr(tvl, fees, reward_per_day)

    poolTpr.push(Math.round(tpr * 10) / 10)
    poolNames.push("HOLY/".concat(first_token_asset.symbol == 'HOLY' ? second_token_asset.symbol: first_token_asset.symbol))
    poolHref.push("https://app.dedust.io/pools/".concat(pool.address))
  });


  return { poolNames, poolTpr, poolHref };
}

// Функция для парсинга данных с сайта Tonview
async function getElementData() {
  const response = await axios.get("https://tonviewer.com/EQAWVv2x6txoc5Nel9CltbfYSBMOOf0R9sb7GnqY-4ncmjcQ")

  const dom = new jsdom.JSDOM(response.data);
  const elementData = dom.window.document.querySelector("#__next > div.cdfkt4l > div.c1sl3usg > div.cedeugn > div.c2te7p5 > div.cwhsyqn > div > div > div > div.i2p6rn6 > div.c1rebrz6 > div.b12cwxum.j1c6v791 > div > div:nth-child(2) > div.crjtn7o.in6dwcq > div").textContent.replace(/[^1-9.]+/g, "")
  return { elementData };
}
// API для передачи данных в React
app.get("/api/pool-info", async (req, res) => {
  const data = await getPoolData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Не удалось получить данные с DeDust." });
  }
});

app.get("/api/element-info", async (req, res) => {
  const data = await getElementData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Не удалось получить данные с Tonview." });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}/api/pool-info`);
});
