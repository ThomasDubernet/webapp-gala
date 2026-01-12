import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetMany } from '../hooks';
import TableProvider from '../components/Tables/provider';
import type { Table, Evenement } from '../types/api';

export function Dashboard() {
  const planRef = useRef<HTMLDivElement>(null);
  const { items: tables, load: loadTables, loading: loadingTables } = useGetMany<Table>('tables');
  const { items: events, load: loadEvents, loading: loadingEvents } = useGetMany<Evenement>('evenements');

  useEffect(() => {
    loadTables();
    loadEvents();
  }, []);

  const loading = loadingTables || loadingEvents;
  const event = events.length > 0 ? events[0] : null;
  const planUrl = event?.plan?.contentUrl || (event?.plan?.filePath ? `/uploads/media/${event.plan.filePath}` : null);
  const hasPlan = !!planUrl;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!hasPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun plan configuré</h2>
          <p className="text-gray-500 mb-4">
            Veuillez d'abord configurer l'événement et uploader un plan de salle.
          </p>
          <a
            href="/evenement/edit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configurer l'événement
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
      <div id="img-box" className="relative h-full" ref={planRef}>
        <img
          src={planUrl!}
          alt="Plan de salle"
          className="h-full w-auto object-contain"
        />
        <TableProvider tables={tables} plan={planRef} load={loadTables} />
      </div>
    </div>
  );
}
