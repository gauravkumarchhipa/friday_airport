"use client";

import { TextTruncate, type TextTruncateProps } from "@/components/common/text-truncate";

export function TableCellEmpty() {
  return <span className="text-white/35">—</span>;
}

export type TableCellTextProps = Omit<TextTruncateProps, "text" | "empty"> & {
  value?: string | number | null;
};

/** Table cell wrapper around {@link TextTruncate} with `—` for empty values. */
export function TableCellText({ value, ...props }: TableCellTextProps) {
  return <TextTruncate text={value} empty={<TableCellEmpty />} {...props} />;
}

export { TextTruncate } from "@/components/common/text-truncate";
