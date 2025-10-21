import HighlightText from "./HighlightText";
import { useDispatch } from "react-redux";
import { setKeyword } from "@/features/search/searchBarSlice";

interface CampingItem {
  name: string;
  address: string;
}

interface SearchDropdownProps {
  open: boolean;
  results: CampingItem[];
  loading: boolean;
  activeIndex: number;
  keyword: string;
  setOpen: (val: boolean) => void;
  setActiveIndex: (index: number) => void;
}

const SearchDropdown = ({
  open,
  results,
  loading,
  activeIndex,
  keyword,
  setOpen,
  setActiveIndex,
}: SearchDropdownProps) => {
  const dispatch = useDispatch();

  if (!open) return null;

  return (
    <ul className="absolute left-0 right-0 top-12 z-20 bg-white border rounded-md shadow-md max-h-72 overflow-auto">
      {loading && <li className="px-4 py-2 text-sm text-gray-500">검색 중…</li>}

      {!loading && results.length === 0 && (
        <li className="px-4 py-3 text-sm text-gray-500">
          검색 결과가 없습니다
        </li>
      )}

      {!loading &&
        results.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            ref={(el) => {
              if (activeIndex === idx && el) {
                const parent = el.parentElement; // ul
                if (parent) {
                  const parentHeight = parent.clientHeight;
                  const itemTop = el.offsetTop;
                  const itemHeight = el.offsetHeight;

                  // 현재 항목이 중앙 근처로 오도록 스크롤 조정
                  parent.scrollTo({
                    top: itemTop - parentHeight / 2 + itemHeight / 2,
                    behavior: "smooth",
                  });
                }
              }
            }}
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
              activeIndex === idx ? "bg-gray-100" : ""
            }`}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(-1)}
            onMouseDown={() => {
              dispatch(setKeyword(item.name));
              setOpen(false);
            }}
          >
            <div className="font-medium">
              <HighlightText text={item.name} keyword={keyword || ""} />
            </div>
            <div className="text-xs text-gray-500">
              <HighlightText text={item.address} keyword={keyword || ""} />
            </div>
          </li>
        ))}
    </ul>
  );
};

export default SearchDropdown;
