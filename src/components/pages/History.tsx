import {
  Box,
  Card,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ChangeEvent, FC, memo, useEffect, useState } from "react";
import { ActiveDarkBlueButton } from "../atoms/button/Button";
import { SecondaryInput } from "../atoms/input/Input";
import AdmTitleText from "../atoms/text/AdmTitleText";

type Props = {
  id: number;
  itemId: number;
  quantity: number;
  day: string;
  incOrDec: boolean;
  name: string;
  stockAmount: number;
};

const History: FC = memo(() => {
  const [originalItemName, setOriginalItemName] = useState<Props[]>([]);
  const [filterItemName, setFilterItemName] = useState<Props[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectItem, setSelectItem] = useState<string>("");

  useEffect(() => {
    const historyDataFetch = async () => {
      const historyResponse = await fetch("http://localhost:8880/stockhistory");
      const historyData = await historyResponse.json();

      const itemResponse = await fetch("http://localhost:8880/items");
      const itemData = await itemResponse.json();

      //商品名入りのオブジェクト作成
      const mergeObj = historyData.map((history: { itemId: number }) => {
        const items = itemData.find(
          (item: { id: number }) => item.id === history.itemId
        );
        return items ? { ...history, name: items.name } : history;
      });

      //日付文字列を置き換え
      const modifiedMergeObj = mergeObj.map((item: Props) => {
        const dateOnly = item.day?.split("T")[0];
        return {
          ...item,
          day: dateOnly,
        };
      });
      setOriginalItemName(modifiedMergeObj); //初期履歴データ
      setFilterItemName(modifiedMergeObj); //検索用履歴データ
    };
    historyDataFetch();
  }, []);

  const searchHistory = () => {
    //商品検索
    // const itemMatchResult = originalItemName.filter(
    //   (item) => item.name === selectItem
    // );
    // setFilterItemName(itemMatchResult);
    // console.log(itemMatchResult);
    //日付検索
    const dateMatchResult = originalItemName.filter(
      (item) => item.day >= startDate && item.day <= endDate
    );
    setFilterItemName(dateMatchResult);
  };

  return (
    <>
      <Box>
        <Card>
          <Box sx={{ m: "30px" }}>
            <AdmTitleText children="在庫履歴確認" />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <label
                style={{ marginRight: "20px", width: "50px" }}
                htmlFor="period"
              >
                期間
              </label>
              <SecondaryInput
                type="date"
                style={{ marginRight: "5px" }}
                id="period"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
              />
              <span
                style={{
                  fontSize: "1.5rem",
                  marginLeft: "10px",
                  marginRight: "10px",
                }}
              >
                〜
              </span>
              <SecondaryInput
                type="date"
                style={{ marginLeft: "5px" }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
              />
            </Box>
            <Box sx={{ mt: "40px" }}>
              <Stack
                direction="row"
                sx={{ alignItems: "flex-end", justifyContent: "space-between" }}
                spacing={2}
              >
                <Box>
                  <label style={{ marginRight: "20px" }} htmlFor="itemName">
                    商品名
                  </label>
                  <Select
                    placeholder="商品名"
                    value={selectItem}
                    sx={{ width: "200px" }}
                    onChange={(e: SelectChangeEvent<string>) =>
                      setSelectItem(e.target.value)
                    }
                  >
                    <MenuItem value="コーヒー">コーヒー</MenuItem>
                    <MenuItem value="ココア">ココア</MenuItem>
                    <MenuItem value="紅茶">紅茶</MenuItem>
                    <MenuItem value="ブライトブレンド">
                      ブライトブレンド
                    </MenuItem>
                    <MenuItem value="LAVAZZA CLASSICO">
                      LAVAZZA CLASSICO
                    </MenuItem>
                  </Select>
                </Box>
                <Box>
                  <ActiveDarkBlueButton
                    children="履歴検索"
                    event={searchHistory}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Card>
        <TableContainer component={Paper} sx={{ mt: "50px" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#C0C0C0", fontWeight: "bold" }}>
                <TableCell sx={{ width: "150px" }}>商品名</TableCell>
                <TableCell align="right">登録日</TableCell>
                <TableCell align="right" sx={{ width: "150px" }}>
                  消費数
                </TableCell>
                <TableCell align="right" sx={{ width: "150px" }}>
                  補充数
                </TableCell>
                <TableCell align="right" sx={{ width: "150px" }}>
                  在庫合計
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterItemName.map((history: Props) => {
                return (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    key={history.id}
                  >
                    <TableCell component="th" scope="row">
                      {history.name}
                    </TableCell>

                    <TableCell align="right">{history.day}</TableCell>
                    <TableCell align="right">
                      {history.incOrDec ? 0 : history.quantity}
                    </TableCell>
                    <TableCell align="right">
                      {history.incOrDec ? history.quantity : 0}
                    </TableCell>
                    <TableCell align="right">{history.stockAmount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {filterItemName.length === 0 &&
              (startDate || endDate || selectItem) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <p style={{ marginLeft: "20px" }}>検索結果がありません</p>
                  </TableCell>
                </TableRow>
              )}
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", m: "20px" }}>
          <Pagination count={3} />
        </Box>
      </Box>
    </>
  );
});

export default History;
