import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetMany } from '../hooks';
import TableProvider from '../components/Tables/provider';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorBoundary } from '../components/ui/error-boundary';
import type { Table, Evenement } from '../types/api';

export function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
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
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!hasPlan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Aucun plan configuré</h2>
          <p className="text-muted-foreground mb-4">
            Veuillez d'abord configurer l'événement et uploader un plan de salle.
          </p>
          <Button asChild>
            <a href="/evenement/edit">
              Configurer l'événement
            </a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallbackTitle="Erreur dans le plan de salle"
      fallbackMessage="Une erreur est survenue lors de l'affichage du plan. Essayez de recharger la page."
    >
      <div ref={containerRef} className="h-full w-full flex items-center justify-center overflow-hidden">
        <div id="img-box" className="relative" ref={planRef}>
          <img
            src={planUrl!}
            alt="Plan de salle"
            className="block max-h-[calc(100vh-120px)] max-w-full h-auto w-auto relative z-0"
          />
          <TableProvider tables={tables} plan={planRef} load={loadTables} container={containerRef} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
