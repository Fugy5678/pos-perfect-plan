import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Product } from '@/types/inventory';

export const useProducts = () => {
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: () => fetchWithAuth('/products'),
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, qty, type, reason }: { id: number; qty: number; type: string; reason: string }) =>
            fetchWithAuth(`/products/${id}/stock`, {
                method: 'PATCH',
                body: JSON.stringify({ qty, type, reason })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        }
    });
};

export const useUpdatePricing = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, sellPrice, costPrice, name, category, qty, reorder }: any) =>
            fetchWithAuth(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, category, qty, reorder, sellPrice, costPrice })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (saleData: {
            items: { productId: number; qty: number }[];
            amountPaid: number;
            paymentMode: string;
            notes?: string;
            attributedToName?: string | null;
        }) =>
            fetchWithAuth(`/sales`, {
                method: 'POST',
                body: JSON.stringify({ ...saleData, discount: 0 })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['sales'] });
        }
    });
};

export const useReportsStatus = (filters?: { from?: string; to?: string; agentId?: string; attributedTo?: string }) => {
    return useQuery({
        queryKey: ['reports', filters],
        queryFn: () => {
            const params = new URLSearchParams();
            if (filters?.from) params.append('from', filters.from);
            if (filters?.to) params.append('to', filters.to);
            if (filters?.agentId) params.append('agentId', filters.agentId);
            if (filters?.attributedTo) params.append('attributedTo', filters.attributedTo);

            return fetchWithAuth(`/reports/summary?${params.toString()}`);
        },
    });
};
