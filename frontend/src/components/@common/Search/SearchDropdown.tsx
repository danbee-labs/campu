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
  isKeyboardNav: boolean;
  setIsKeyboardNav: (v: boolean) => void;
}

const SearchDropdown = ({
  open,
  results,
  loading,
  activeIndex,
  keyword,
  setOpen,
  setActiveIndex,
  isKeyboardNav,
  setIsKeyboardNav,
}: SearchDropdownProps) => {
  const dispatch = useDispatch();

  if (!open) return null;

  return (
    <ul
      onMouseMove={() => setIsKeyboardNav(false)}
      className="absolute left-0 right-0 top-12 z-20 bg-white border rounded-md shadow-md max-h-72 overflow-auto"
    >
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
                const parent = el.parentElement;
                if (!parent) return;

                const itemTop = el.offsetTop;
                const itemBottom = itemTop + el.offsetHeight;
                const viewTop = parent.scrollTop;
                const viewBottom = viewTop + parent.clientHeight;

                // 이미 보이는 영역이면 스크롤하지 않음
                if (itemTop >= viewTop && itemBottom <= viewBottom) return;

                // 새 항목이 화면 위로 벗어나면 바로 위로 이동 (빠르게)
                if (itemTop < viewTop) {
                  parent.scrollTo({ top: itemTop, behavior: "auto" });
                  return;
                }

                // 새 항목이 아래로 벗어나면 부드럽게 이동
                parent.scrollTo({
                  top: itemTop - parent.clientHeight / 3,
                  behavior: "smooth",
                });
              }
            }}
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
              activeIndex === idx ? "bg-gray-50" : ""
            }`}
            onMouseEnter={() => {
              if (!isKeyboardNav) setActiveIndex(idx);
            }}
            onMouseLeave={() => {
              if (!isKeyboardNav) setActiveIndex(-1);
            }}
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
