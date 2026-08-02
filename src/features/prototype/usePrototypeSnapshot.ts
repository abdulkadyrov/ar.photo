import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreSnapshot } from "../../types";
import { loadData } from "../../lib/db";

const prototypeSnapshotKey = ["prototype", "snapshot"] as const;

const emptySnapshot: StoreSnapshot = {
  projects: [],
  classes: [],
  students: [],
  livePhotos: [],
  media: [],
  mediaBlobs: [],
};

export function usePrototypeSnapshot() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: prototypeSnapshotKey,
    queryFn: loadData,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: prototypeSnapshotKey });
  }, [queryClient]);

  return {
    snapshot: query.data ?? emptySnapshot,
    loading: query.isPending,
    error: query.error,
    refresh,
  };
}
