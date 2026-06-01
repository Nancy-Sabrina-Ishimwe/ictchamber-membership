import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import type { AttendanceRecord } from '../types/eventAttendance';

type AttendancePayload = {
  event: {
    id: number;
    title: string;
    attendanceToken?: string | null;
    attendanceUrl?: string | null;
  };
  attendances: AttendanceRecord[];
};

export function useEventAttendance(eventId: string) {
  const [attendanceUrl, setAttendanceUrl] = useState('');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [eventMeta, setEventMeta] = useState<AttendancePayload['event'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<{ data?: AttendancePayload }>(`/events/${eventId}/attendances`);
      const payload = response.data.data;
      if (payload?.event) {
        setEventMeta(payload.event);
        if (payload.event.attendanceUrl) {
          setAttendanceUrl(payload.event.attendanceUrl);
        }
      }
      setAttendances(payload?.attendances ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load attendance.');
      setAttendances([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const generateLink = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await api.post<{ data?: { attendanceUrl?: string } }>(
        `/events/${eventId}/attendance-token`,
      );
      const url = response.data.data?.attendanceUrl;
      if (url) setAttendanceUrl(url);
      await load();
    } catch (genError) {
      setError(genError instanceof Error ? genError.message : 'Failed to generate QR link.');
    } finally {
      setIsGenerating(false);
    }
  }, [eventId, load]);

  return {
    attendanceUrl,
    attendances,
    eventMeta,
    isLoading,
    isGenerating,
    error,
    setError,
    load,
    generateLink,
  };
}
