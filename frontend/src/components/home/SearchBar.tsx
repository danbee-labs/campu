import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/app/store";
import {
  dateStringToDate,
  dateToDateString,
  formatSimpleDate,
} from "@/utils/formatDateTime";
import {
  setEndDate,
  setKeyword,
  setPeople,
  setStartDate,
} from "@/features/search/searchBarSlice";
import {
  setEndDate as setCampingEndDate,
  setStartDate as setCampingStartDate,
} from "@/features/reservation/campingDateSlice";
import { setHeadCount } from "@/features/reservation/HeadCountSlice";
import SearchRegion from "@/components/@common/Search/SearchRegion";
import { RegionList } from "@/components/@common/Search/RegionList";
import Modal from "../@common/Modal/Modal";
import CalendarSubmit from "../@common/Calendar/CalendarSubmit";
import Calendar from "../@common/Calendar/Calendar";
import SearchDropdown from "../@common/Search/SearchDropdown";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowRotateRight } from "react-icons/fa6";
import { RiMapPinLine } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlinePersonOutline } from "react-icons/md";
import { LuSearch } from "react-icons/lu";

const SearchBar = ({ state }: { state?: string }) => {
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [scheduleModal, setScheduleModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { startDate, endDate, keyword } = useSelector(
    (state: RootState) => state.searchBar
  );

  const searchBarState = useSelector((state: RootState) => state.searchBar);

  const initialStartDate = dateStringToDate(startDate);
  const initialEndDate = dateStringToDate(endDate);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(
    initialStartDate
  );
  const [localEndDate, setLocalEndDate] = useState<Date | null>(initialEndDate);
  const [searchKeyword, setSearchKeyword] = useState<string | null>(
    keyword || null
  );

  // 검색 결과 타입
  type CampingItem = { name: string; address: string };

  // 검색 상태 관리
  const [results, setResults] = useState<CampingItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  // 일정 초기화
  const resetCalendar = () => {
    setLocalStartDate(dateStringToDate(startDate));
    setLocalEndDate(dateStringToDate(endDate));
  };

  // 인원 증감 함수
  const handleDecrease = () => {
    if (numberOfPeople > 1) {
      setNumberOfPeople(numberOfPeople - 1);
      dispatch(setPeople(numberOfPeople - 1));
      dispatch(setHeadCount(numberOfPeople - 1));
    }
  };
  const handleIncrease = () => {
    if (numberOfPeople < 6) {
      setNumberOfPeople(numberOfPeople + 1);
      dispatch(setPeople(numberOfPeople + 1));
      dispatch(setHeadCount(numberOfPeople + 1));
    }
  };

  // 키워드 입력
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchKeyword(value);
    dispatch(setKeyword(value));
  };

  // const handleKeyPress = (e: KeyboardEvent) => {
  //   if (e.key === "Enter") {
  //     goToSearchPage();
  //   }
  // };

  // Enter 키 감지
  // useEffect(() => {
  //   window.addEventListener("keydown", handleKeyPress);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyPress);
  //   };
  // }, []);

  const goToSearchPage = () => {
    navigate("/search");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 드롭다운이 열려 있고 결과가 있을 때만 키보드 네비
    if (open && results.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setActiveIndex((prev) => (prev + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          const selected = results[activeIndex];
          dispatch(setKeyword(selected.name));
          setOpen(false);
          return;
        }
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }

    // 드롭다운이 닫혀 있거나 결과가 없을 때 Enter는 기본 검색
    if (e.key === "Enter") {
      goToSearchPage();
    }
  };

  // keyword 변경 시 서버 요청 (디바운스)
  useEffect(() => {
    const controller = new AbortController(); // 이전 요청을 중간에 취소할 수 있게 해주는 객체

    // 입력이 없으면 목록 닫고 초기화
    if (!keyword || !keyword.trim()) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const lowerKeyword = keyword.trim().toLowerCase();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3005/api/input-performance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword }),
          signal: controller.signal,
        });

        const data: CampingItem[] = await res.json();

        setResults((prev) => {
          // 이전 결과 중 여전히 keyword 포함되는 항목 유지
          const stillValid = prev.filter(
            (camp) =>
              camp.name.toLowerCase().includes(lowerKeyword) ||
              camp.address.toLowerCase().includes(lowerKeyword)
          );

          // 서버에서 받은 새 결과 중 중복되지 않은 것만 추가
          const newOnes = data.filter(
            (camp) =>
              !stillValid.some(
                (prevCamp) =>
                  prevCamp.name === camp.name &&
                  prevCamp.address === camp.address
              )
          );

          return [...stillValid, ...newOnes];
        });
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
          console.error("검색 요청 실패:", err.message);
        } else {
          console.error("알 수 없는 오류:", err);
        }
        // setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    // cleanup: keyword 바뀌면 이전 요청 취소
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  // 일정 스토어에 저장
  const calendarSubmit = () => {
    const formattedStartDate = dateToDateString(localStartDate);
    const formattedEndDate = dateToDateString(localEndDate);
    if (formattedStartDate !== null && formattedEndDate !== null) {
      dispatch(setStartDate(formattedStartDate));
      dispatch(setEndDate(formattedEndDate));
      dispatch(setCampingStartDate(formattedStartDate));
      dispatch(setCampingEndDate(formattedEndDate));
    }
  };

  const toggleScheduleModal = () => {
    setScheduleModal(!scheduleModal); // 모달 토글
    setLocalStartDate(dateStringToDate(startDate)); // 저장 안하고 닫으면 초기화
    setLocalEndDate(dateStringToDate(endDate));
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        {/* 지역 선택 */}
        <div className="flex items-center w-[33%] border bg-white rounded-md p-3 max-h-11">
          <RiMapPinLine />
          <SearchRegion list={RegionList} />
        </div>

        {/* 날짜 선택 */}
        <div className="relative w-[33%]">
          <div
            className="flex items-center border bg-white rounded-md p-3 max-h-11 whitespace-nowrap"
            onClick={() => toggleScheduleModal()}
          >
            <FaRegCalendarAlt />
            <div className="flex items-center w-full cursor-pointer text-xs px-2">
              <p className="pr-2">
                {!initialStartDate || !initialEndDate ? (
                  <>날짜를 선택해주세요</>
                ) : (
                  <>
                    {formatSimpleDate(initialStartDate)} -{" "}
                    {formatSimpleDate(initialEndDate)}
                  </>
                )}
              </p>
              <IoIosArrowDown />
            </div>
          </div>
        </div>

        {/* 인원 선택 */}
        <div className="flex items-center w-[33%] border bg-white rounded-md p-3 max-h-11">
          <MdOutlinePersonOutline />
          <div className="flex items-center text-xs">
            <p className="px-2 whitespace-nowrap">인원 선택</p>
            <div className="flex items-center">
              <AiOutlineMinusCircle
                onClick={handleDecrease}
                className="text-MAIN_GREEN cursor-pointer"
              />
              <p className="px-3">{searchBarState.numberOfPeople}</p>
              <AiOutlinePlusCircle
                onClick={handleIncrease}
                className="text-MAIN_GREEN cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 검색어 입력 */}
      <div className="flex mt-2 items-center">
        <div className="relative flex w-full items-center">
          <div className="flex w-full items-center border bg-white rounded-md p-3 max-h-11">
            <LuSearch />
            <input
              className="ml-2 w-full placeholder-black text-xs border-none outline-none focus:ring-0"
              placeholder="키워드로 캠핑장을 검색해보세요"
              value={keyword || ""}
              onChange={handleKeywordChange}
              onFocus={() => results.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={handleKeyDown}
            />
            <SearchDropdown
              open={open}
              results={results}
              loading={loading}
              activeIndex={activeIndex}
              keyword={keyword || ""}
              setOpen={setOpen}
              setActiveIndex={setActiveIndex}
              isKeyboardNav={isKeyboardNav}
              setIsKeyboardNav={setIsKeyboardNav}
            />
          </div>
        </div>

        {/* 검색버튼 */}
        {state === "main" && (
          <button
            onClick={goToSearchPage}
            className="ml-2 px-6 py-3 bg-[#186D41] text-white rounded-md text-sm whitespace-nowrap"
          >
            검색하기
          </button>
        )}
      </div>

      {scheduleModal && (
        <Modal width="w-[55%]" onClose={toggleScheduleModal} title="일정 선택">
          <div>
            <div className="w-[70%] h-[375px] mx-auto">
              <Calendar
                startDate={localStartDate}
                endDate={localEndDate}
                setStartDate={setLocalStartDate}
                setEndDate={setLocalEndDate}
              />
            </div>
            <button
              onClick={resetCalendar}
              className="flex items-center gap-2 cursor-pointer p-2"
            >
              <FaArrowRotateRight color="C9C9C9" />
              <span className="text-GRAY">일정 초기화</span>
            </button>
            <CalendarSubmit
              startDate={localStartDate}
              endDate={localEndDate}
              onClick={() => {
                toggleScheduleModal();
                calendarSubmit();
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default SearchBar;
