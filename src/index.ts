import 'dotenv/config';

import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import { Client } from '@line/bot-sdk';

import { addressBar, tableHeader, poolLine, summary } from './views/flexTemplate';
import { Masterchef, getPositions } from './services/masterchef';
import { PriceService } from './services/priceService';
import { Web3Service } from './services/web3Service';
import { TokenHelper } from './services/tokenHelper';
import MasterChef from './abi/MasterChef.json';
import { isValidAddress, shortenAddress } from './utils';
import { pools } from './constants/pools';

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

const web3Service = new Web3Service();
const priceService = new PriceService();
const masterchefAddress = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
const contract = web3Service.getContract(MasterChef.abi, masterchefAddress);
const helper = new TokenHelper(web3Service, priceService);
const masterchef = new Masterchef(contract, helper);

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello my demo linexswap</h1>');
  res.end();
});

app.get('/test', (req, res) => {
  res.status(200).json('Test Succeed');
})

app.get('/wallet/:id', async (req, res) => {
  const address = _.get(req, 'params.id');
  if(!isValidAddress(address)) res.status(200).json('Invalid address');
  const stakings = await masterchef.getStaking(pools, address);
  res.status(200).json({
    address,
    stakings,
  })
})

app.post('/webhook', async (req, res) => {
  const event = _.get(req, 'body.events[0]');
  const eventType = _.get(event, 'message.type');
  const message = _.get(event, 'message.text');
  const replyToken = _.get(event, 'replyToken') as string;

  if (eventType !== 'text' || !isValidAddress(message)) {
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text:
      'Please input valid BSC address. For example, 0x3c74c735b5863c0baf52598d8fd2d59611c8320f 🐳',
    } as any);
    return res.sendStatus(200);
  }

  const address = message;
  const stakings = await masterchef.getStaking(pools, address);
  const positions = _.sortBy(
    stakings.map(stake => getPositions(stake)),
    ['totalValue']
  ).reverse();
  const totalValue = positions.reduce((sum, position) => sum + position.totalValue, 0);

  const addr = addressBar(shortenAddress(address));
  const tHeader = tableHeader();
  const poolLines = positions.map((position) => poolLine(position));
  const footerSum = summary(totalValue);

  const flexMsg: any = {
    type: 'flex',
    altText: 'Pancake Staking',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          addr,
          tHeader,
          ...poolLines,
          footerSum,
        ],
      },
    },
  };

  console.log({ flexMsg, addr, tHeader, poolLines, footerSum });

  await lineClient.replyMessage(replyToken, flexMsg);
  return res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);
});
