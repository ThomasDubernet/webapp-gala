import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetMany } from '../hooks';
import { useDialogs } from '../contexts/DialogContext';
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
  const { subscribeToDataChange } = useDialogs();
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Calculate optimal image size to fill container while maintaining aspect ratio
  const calculateImageSize = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const containerWidth = containerRef.current.clientWidth;
    const naturalRatio = img.naturalWidth / img.naturalHeight;

    let width: number, height: number;
    if (containerWidth / containerHeight > naturalRatio) {
      // Container is wider - height is the constraint
      height = containerHeight;
      width = height * naturalRatio;
    } else {
      // Container is taller - width is the constraint
      width = containerWidth;
      height = width / naturalRatio;
    }

    setImageDimensions({ width, height });
  }, []);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    calculateImageSize(e.currentTarget);
  }, [calculateImageSize]);

  // Recalculate on window resize
  useEffect(() => {
    const imgElement = planRef.current?.querySelector('img');
    if (!imgElement) return;

    const handleResize = () => {
      if (imgElement.complete) {
        calculateImageSize(imgElement as HTMLImageElement);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateImageSize, imageDimensions]);

  useEffect(() => {
    loadTables();
    loadEvents();
  }, []);

  // Subscribe to data changes from dialogs (PersonneDialog, TableDialog)
  useEffect(() => {
    const unsubscribe = subscribeToDataChange(() => {
      loadTables();
    });
    return unsubscribe;
  }, [subscribeToDataChange, loadTables]);

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
      <div ref={containerRef} className="h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden">
        <div id="img-box" className="relative" ref={planRef}>
          <img
            src={planUrl!}
            alt="Plan de salle"
            className="block"
            onLoad={handleImageLoad}
            style={imageDimensions ? { width: imageDimensions.width, height: imageDimensions.height } : { maxHeight: 'calc(100vh - 64px)', maxWidth: '100%' }}
          />
          <TableProvider tables={tables} plan={planRef} load={loadTables} container={containerRef} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
