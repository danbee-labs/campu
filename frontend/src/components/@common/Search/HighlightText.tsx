interface HighlightTextProps {
  text: string;
  keyword: string;
}

const HighlightText = ({ text, keyword }: HighlightTextProps) => {
  if (!keyword) return <>{text}</>;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span key={i} className="text-[#2ac977] font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;
