import { useOrg } from "@/hooks/useOrg"
import api from "@/lib/axios"
import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react"

interface RowType {
    id: string,
    name: string,
    category: string,
    unit: string
    defaultLeadTime: number,
    supplierQuote: {
        id: string,
        supplier: string,
        truePrice: number,
        standardRate: number,
        leadTime: number
    }[]
}

const CatalogueTable = () => {
    const [items, setItems] = useState<RowType[]>([])
    const [error, setError] = useState<string | null>(null);
    const org = useOrg();



    useEffect(() => {
        
        const fetchCatalogue = async () => {
            try {
                const data = api.get('/catalogue/getCatalogue', {
                    headers: {
                        "x-org-id" : org.membership?.orgId
                    }
                })
                setItems(data as RowType[]);
            } catch(error) {
                console.log(error)
            }
        }

        fetchCatalogue()
    },[])

    return (
        <div>
            table
        </div>
    )
}

export default CatalogueTable;