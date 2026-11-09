"use client";

import {ChevronFirst, ChevronLast, ChevronLeft, ChevronRight} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
};

export default function Pagination({
                                       page,
                                       pageSize,
                                       totalItems,
                                       onPageChange,
                                       onPageSizeChange,
                                       pageSizeOptions = [10, 25, 50, 100],
                                   }: Props) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
                Showing {start}–{end} of {totalItems}
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        Rows per page
                    </span>

                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value));
                        }}
                    >
                        <SelectTrigger size="sm" className="w-20">
                            <SelectValue/>
                        </SelectTrigger>

                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <span className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="First page"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(1)}
                    >
                        <ChevronFirst/>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft/>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight/>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Last page"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(totalPages)}
                    >
                        <ChevronLast/>
                    </Button>
                </div>
            </div>
        </div>
    );
}