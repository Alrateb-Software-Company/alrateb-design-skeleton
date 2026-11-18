"use client";

import { Pagination } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/** HeroUI pagination bar shared by all list views. */
export function ListPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-5 flex items-center justify-center">
      <Pagination.Content className="flex items-center gap-3">
        <Pagination.Item>
          <Pagination.Previous
            aria-label={t("common.previousPage")}
            isDisabled={page <= 1}
            onPress={() => onChange(page - 1)}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Pagination.Previous>
        </Pagination.Item>
        <Pagination.Summary className="text-sm text-neutral-500">
          {page} / {totalPages}
        </Pagination.Summary>
        <Pagination.Item>
          <Pagination.Next
            aria-label={t("common.nextPage")}
            isDisabled={page >= totalPages}
            onPress={() => onChange(page + 1)}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
