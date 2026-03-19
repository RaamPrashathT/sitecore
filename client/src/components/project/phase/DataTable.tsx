import { 
    flexRender, 
    getCoreRowModel, 
    useReactTable 
  } from '@tanstack/react-table';
  import { columns } from './columns';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import type { PhaseItem } from '@/features/project/phase/hooks/usePhaseList';
  interface DataTableProps {
      data: PhaseItem[];
  }
  
  const DataTable = ({data} : DataTableProps) => {
      const table = useReactTable({
          data,
          columns,
          getCoreRowModel: getCoreRowModel()
      })
  
      return (
          <div>
              <Table>
                  <TableHeader>
                      {table.getHeaderGroups().map(headerGroup => (
                          <TableRow key={headerGroup.id} className=''>
                              {headerGroup.headers.map(header => (
                                  <TableHead key={header.id} className='text-lg'>
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                  </TableHead>
                              ))}
                          </TableRow>
                      ))}
                  </TableHeader>
                  <TableBody className='p-0'>
                      {table.getRowModel().rows.map(row => (
                          <TableRow key={row.id} className='p-0'>
                              {row.getVisibleCells().map(cell => (
                                  <TableCell key={cell.id} className=' p-0'>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                              ))}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      )
  }
  
  export default DataTable;