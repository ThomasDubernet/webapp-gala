import React, { useMemo, useState } from 'react'
import { Pencil, Phone, Mail, MapPin, Users } from 'lucide-react'
import '../styles/tailwind.css'
import { Card, CardHeader, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { ConfirmModal } from './ui/modal'
import { apiPut } from '../lib/api'
import type { Personne } from '../types/api'

interface PersonCardProps {
  personne: Personne
  onRefresh?: () => void
  variant?: 'default' | 'fullpage'
  onEdit?: (id: number) => void
}

type PaymentStatus = 'paid' | 'partial' | 'unpaid'

const paymentBadgeConfig: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'destructive'; icon: string }> = {
  paid: { label: 'Payé', variant: 'success', icon: '✓' },
  partial: { label: 'Partiel', variant: 'warning', icon: '⚠' },
  unpaid: { label: 'Non payé', variant: 'destructive', icon: '✗' },
}

export function PersonCard({ personne: initialPersonne, onRefresh, variant = 'default', onEdit }: PersonCardProps) {
  const [person, setPerson] = useState<Personne>(initialPersonne)
  const [awaitingCheckedValue, setAwaitingCheckedValue] = useState<boolean | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const {
    id,
    civilite,
    prenom,
    nom,
    adresse,
    codePostal,
    ville,
    email,
    telephone,
    table,
    montantBillet,
    montantPaye,
    present: isPresent,
    smsSended,
  } = useMemo(() => person, [person])

  // Calcul du statut de paiement
  const paymentStatus: PaymentStatus = useMemo(() => {
    if (montantBillet === null || montantBillet === undefined) return 'unpaid'
    if (montantBillet === montantPaye) return 'paid'
    if (montantPaye && parseFloat(String(montantPaye)) > 0) return 'partial'
    return 'unpaid'
  }, [montantBillet, montantPaye])

  const paymentBadge = paymentBadgeConfig[paymentStatus]

  // Mise à jour de la présence
  const updatePresence = async (presence: boolean | null, withSms: boolean) => {
    try {
      const data = await apiPut<Personne>(`/api/personnes/${id}/update-presence`, {
        present: presence ?? !isPresent,
        withSms,
      })
      setPerson(data)
      onRefresh?.()
    } catch (error) {
      console.warn('ERROR_PRESENT_CHANGE_01', error)
    }
  }

  const handleCheckboxChange = async (event: { target: { checked: boolean } }) => {
    const newCheckValue = event.target.checked

    if (smsSended) {
      setAwaitingCheckedValue(newCheckValue)
      setOpenModal(true)
    } else {
      await updatePresence(newCheckValue, false)
    }
  }

  // Nom complet formaté
  const fullName = [civilite?.nom, prenom, nom?.toUpperCase()]
    .filter(Boolean)
    .join(' ') || `${prenom} ${nom?.toUpperCase() || ''}`

  return (
    <>
      {/* Modal de confirmation SMS */}
      <ConfirmModal
        open={openModal}
        onClose={() => {
          setAwaitingCheckedValue(null)
          setOpenModal(false)
        }}
        onConfirm={() => {
          updatePresence(awaitingCheckedValue, true)
        }}
        title="Confirmation"
        message="Confirmer cette action ?"
        confirmText="Oui"
        cancelText="Non"
      />

      {/* Carte personne */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={paymentBadge.variant}>
              <span>{paymentBadge.icon}</span>
              {paymentBadge.label}
            </Badge>
            <Badge variant={table ? 'info' : 'warning'}>
              <Users className="h-3 w-3" />
              {table ? `Table ${table.numero}` : 'Sans table'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {onEdit ? (
              <Button variant="ghost" size="icon" onClick={() => onEdit(id)} title="Modifier">
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <a href={`/personne/${id}/edit`} title="Modifier">
                  <Pencil className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Nom */}
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {fullName}
          </h3>

          {/* Infos */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
              {telephone ? (
                <a href={`tel:${telephone}`} className="hover:text-primary">
                  {telephone}
                </a>
              ) : (
                <span className="text-muted-foreground/50 italic">Non renseigné</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary truncate"
                  title={email}
                >
                  {email}
                </a>
              ) : (
                <span className="text-muted-foreground/50 italic">Non renseigné</span>
              )}
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
              {adresse ? (
                <span>
                  {adresse}, {codePostal} {ville}
                </span>
              ) : (
                <span className="text-muted-foreground/50 italic">Non renseigné</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isPresent || false}
              onChange={handleCheckboxChange}
            />
            <span className="text-sm text-muted-foreground">Présent</span>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
