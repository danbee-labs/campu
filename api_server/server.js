import express from "express";
import ORIGIN_CAMPING_DATA from './db/index.js';
import { timer, basicSearch } from "./utils.js";
import { addressTrie, nameTrie } from "./trieInstance.js";
import cors from "cors";


const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json({ limit: "10kb" })); 

app.get("/api/ping", (req, res) => {
  return res.status(200).json({ success: true });
});


app.get('/api/camping_data', async (req, res) => {
  // 여기서 성능 테스트용 데이터를 생성하거나 불러옴
  const data = ORIGIN_CAMPING_DATA;
  const slice = data.splice(0, 100);
  return res.status(200).json({ success: true, data: slice });
})

app.post('/api/search', async (req, res) => {
  const { keyword } = req.body;
  let nameResults = [];
  let addressResults = [];



  const fn1 = ( ) => {
    nameResults = nameTrie.searchWord(keyword, 'name');
    addressResults = addressTrie.searchWord(keyword, 'address');
  }


  const fn2 = ( ) => {
    basicSearch(ORIGIN_CAMPING_DATA, 'name', keyword);
    basicSearch(ORIGIN_CAMPING_DATA, 'address', keyword);
  }

  const optTime = timer(fn1);
  const basicTime = timer(fn2);

  return res.status(200).json({ success: true, data: { name: nameResults, address: addressResults, optTime, basicTime } });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
