"use client";

import { Button } from "@/components/ui/button";
import { Page } from "@react-pdf/renderer";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Tipos

type Ellipsis = { type: "ellipsis"; key: string };
type PageItem = number | Ellipsis;

//constantes

const MAX_VISIBLE = 7;
const EDGE_THRESHOLD = 3;
const PAGES_FROM_START = 5;
const PAGES_FROM_END = 5;

//helpers

const ellipsis = (key: string): Ellipsis => ({ type: "ellipsis", key });
const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);
const isEllipsis = (item: PageItem): item is Ellipsis =>
  typeof item === "object";

// gerador de paginas

function generatePageNumbers(current: number, total: number): PageItem[] {
  if (total <= MAX_VISIBLE) {
    return range(1, total);
  }

  if (current <= EDGE_THRESHOLD) {
    return [...range(1, PAGES_FROM_START), ellipsis("end"), total];
  }

  if (current >= total - EDGE_THRESHOLD + 1) {
    return [1, ellipsis("start"), ...range(total - PAGES_FROM_END + 1, total)];
  }

  return [
    1,
    ellipsis("start"),
    ...range(current - 1, current + 1),
    ellipsis("end"),
    total,
  ];
}
