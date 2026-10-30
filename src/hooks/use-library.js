import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryClient } from '@/api/libraryClient';

export function useLibrary() {
  const queryClient = useQueryClient();
  const key = ['library'];
  const query = useQuery({ queryKey: key, queryFn: libraryClient.list, retry: 1, staleTime: 30000 });
  const save = useMutation({
    mutationFn: /** @param {{ manga: any, shelf: string }} input */ (input) => libraryClient.save(input.manga, input.shelf),
    onSuccess: item => queryClient.setQueryData(key, /** @param {any[]} items */ (items = []) => [item, ...items.filter(entry => entry.id !== item.id)]),
  });
  const remove = useMutation({
    mutationFn: libraryClient.remove,
    onSuccess: (_, id) => queryClient.setQueryData(key, /** @param {any[]} items */ (items = []) => items.filter(entry => entry.id !== id)),
  });
  return { ...query, entries: query.data || [], save, remove };
}
