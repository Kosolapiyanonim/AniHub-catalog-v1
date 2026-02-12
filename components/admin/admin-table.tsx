"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminTableProps<T> {
  data: T[]
  columns: {
    key: keyof T | string
    label: string
    render?: (value: any, row: T) => React.ReactNode
  }[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  onSearch?: (query: string) => void
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  className?: string
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  searchable = false,
  onSearch,
  pagination,
  className,
}: AdminTableProps<T>) {
  return (
    <div className={cn("space-y-4", className)}>
      {searchable && onSearch && (
        <div className="flex justify-end">
          <Input
            placeholder="Поиск..."
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      
      <div className="rounded-md border border-slate-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800 hover:bg-slate-800">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="text-slate-300">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-slate-400 py-8"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "bg-slate-800/50 hover:bg-slate-800 cursor-pointer",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className="text-slate-300">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Страница {pagination.page} из {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}





