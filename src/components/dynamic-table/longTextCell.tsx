import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { dynamic_table_cell_content_class } from "./cellLayout";

export const DEFAULT_LONG_TEXT_MAX_CHARS = 30;

interface LongTextCellProps {
  text: string;
  maxChars?: number;
}

/** Muestra hasta `maxChars` caracteres; si se recorta, el texto completo va en un tooltip. */
export const LongTextCell = ({
  text,
  maxChars = DEFAULT_LONG_TEXT_MAX_CHARS,
}: LongTextCellProps) => {
  // Array.from evita partir emojis / pares sustitutos.
  const chars = Array.from(text);

  if (chars.length <= maxChars) {
    return <span className={dynamic_table_cell_content_class}>{text}</span>;
  }

  const truncated = `${chars.slice(0, maxChars).join("").trimEnd()}…`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={`${dynamic_table_cell_content_class} cursor-help`}
            aria-label={text}
          />
        }
      >
        {truncated}
      </TooltipTrigger>
      <TooltipContent className="block whitespace-pre-wrap break-words">
        {text}
      </TooltipContent>
    </Tooltip>
  );
};
