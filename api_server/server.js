import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/api/ping", (req, res) => {
  return res.status(200).json({ success: true });
});

// 입력한 keyword로 JSON 검색
app.post("/api/input-performance", (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ message: "검색어가 없습니다." });
  }

  try {
    // JSON 파일 읽기
    const data = fs.readFileSync("./campings.json", "utf-8");
    const campingList = JSON.parse(data);
    const lowerKeyword = keyword.toLowerCase();

    // keyword가 들어간 캠핑장만 필터링 (대소문자 구분 없이)
    const filtered = campingList.filter(
      (camp) =>
        camp.name.toLowerCase().includes(lowerKeyword) ||
        camp.address.toLowerCase().includes(lowerKeyword)
    );

    return res.status(200).json(filtered);
  } catch (err) {
    console.error("캠핑장 데이터 읽기 실패: ", err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
