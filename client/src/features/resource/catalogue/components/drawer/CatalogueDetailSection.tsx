import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, X, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useCatalogueDetail, useUpdateCatalogueItem } from '../../hooks/useCatalogueDrawer'
import { createCatalogueItemSchema, type CreateCatalogueItemInput } from '../../catalogue.schema'

const CATEGORY_OPTIONS = [
    { value: 'MATERIALS', label: 'Materials' },
    { value: 'LABOUR', label: 'Labour' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUBCONTRACTORS', label: 'Subcontractors' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'OVERHEAD', label: 'Overhead' },
] as const

interface Props {
    catalogueId: string
    isAdmin: boolean
}

// A single field cell — shows label + either a value or an input
const DetailCell = ({
    label,
    value,
    editing,
    children,
}: {
    label: string
    value?: string
    editing: boolean
    children?: React.ReactNode
}) => (
    <div>
        <p className="text-label mb-1">{label}</p>
        {editing ? children : <p className="text-body text-foreground">{value ?? '—'}</p>}
    </div>
)

const CatalogueDetailSection = ({ catalogueId, isAdmin }: Props) => {
    const [editing, setEditing] = useState(false)
    const { data, isLoading, isError } = useCatalogueDetail(catalogueId)
    const update = useUpdateCatalogueItem(catalogueId)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
        useForm<CreateCatalogueItemInput>({
            resolver: zodResolver(createCatalogueItemSchema),
        })

    const startEdit = () => {
        if (!data) return
        reset({
            name: data.name,
            category: data.category,
            unit: data.unit,
            defaultLeadTime: data.defaultLeadTime ?? 0,
        })
        setEditing(true)
    }

    const onSubmit = (values: CreateCatalogueItemInput) => {
        update.mutate(values, { onSuccess: () => setEditing(false) })
    }

    // ── Header row (always rendered) ─────────────────────────────────────────
    const header = (
        <div className="flex items-center justify-between mb-4">
            <p className="text-label uppercase tracking-widest">Details</p>
            {isAdmin && !editing && (
                <button
                    type="button"
                    onClick={startEdit}
                    className="row gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Pencil className="w-3 h-3" />
                    Edit
                </button>
            )}
        </div>
    )

    if (isLoading) {
        return (
            <div>
                {header}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={`det-skel-${i}`}>
                            <Skeleton className="h-2.5 w-14 mb-2 rounded-sm" />
                            <Skeleton className="h-4 w-28 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div>
                {header}
                <div className="flex items-center gap-2 py-2 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load item details
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {header}

            {/* ── 2-col grid — same layout in both view and edit mode ─── */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailCell label="Name" value={data.name} editing={editing}>
                    <Input
                        {...register('name')}
                        className="h-8 text-sm"
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name.message}</p>}
                </DetailCell>

                <DetailCell label="Category" value={data.category} editing={editing}>
                    <Select
                        value={watch('category')}
                        onValueChange={(v) => setValue('category', v as CreateCatalogueItemInput['category'])}
                    >
                        <SelectTrigger size="sm" className="w-full h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORY_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="text-sm">
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive mt-0.5">{errors.category.message}</p>}
                </DetailCell>

                <DetailCell label="Unit" value={data.unit} editing={editing}>
                    <Input
                        {...register('unit')}
                        className="h-8 text-sm"
                        aria-invalid={!!errors.unit}
                    />
                    {errors.unit && <p className="text-xs text-destructive mt-0.5">{errors.unit.message}</p>}
                </DetailCell>

                <DetailCell
                    label="Lead Time"
                    value={data.defaultLeadTime == null ? '—' : `${data.defaultLeadTime} days`}
                    editing={editing}
                >
                    <Input
                        type="number"
                        min={0}
                        {...register('defaultLeadTime', { valueAsNumber: true })}
                        className="h-8 text-sm font-mono"
                        aria-invalid={!!errors.defaultLeadTime}
                    />
                    {errors.defaultLeadTime && (
                        <p className="text-xs text-destructive mt-0.5">{errors.defaultLeadTime.message}</p>
                    )}
                </DetailCell>
            </div>

            {/* ── Save / Cancel — only in edit mode ────────────────────── */}
            {editing && (
                <div className="flex items-center gap-2 mt-4">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={update.isPending}
                        className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5"
                    >
                        {update.isPending
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Check className="w-3 h-3" />}
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-muted-foreground"
                        onClick={() => setEditing(false)}
                    >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                    </Button>
                </div>
            )}
        </form>
    )
}

export default CatalogueDetailSection
