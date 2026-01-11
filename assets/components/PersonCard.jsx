import React, { useMemo, useState } from 'react'
import { Box, Button as MuiButton, Modal, Typography } from '@mui/material'
import { Pencil, Phone, Mail, MapPin, Users } from 'lucide-react'
import '../styles/tailwind.css'
import { Card, CardHeader, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

/**
 * Composant carte personne moderne avec Tailwind + Shadcn
 * Utilisé dans Search et HotesseSearch
 */
export function PersonCard({ personne: initialPersonne, onRefresh, variant = 'default' }) {
  const [person, setPerson] = useState(initialPersonne)
  const [awaitingCheckedValue, setAwaitingCheckedValue] = useState(null)
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
  const paymentStatus = useMemo(() => {
    if (montantBillet === null) return 'unpaid'
    if (montantBillet === montantPaye) return 'paid'
    if (parseFloat(montantPaye) > 0) return 'partial'
    return 'unpaid'
  }, [montantBillet, montantPaye])

  const paymentBadge = {
    paid: { label: 'Payé', variant: 'success', icon: '✓' },
    partial: { label: 'Partiel', variant: 'warning', icon: '⚠' },
    unpaid: { label: 'Non payé', variant: 'destructive', icon: '✗' },
  }[paymentStatus]

  // Mise à jour de la présence
  const updatePresence = async (presence, withSms) => {
    try {
      const response = await fetch(`/api/personnes/${id}/update-presence`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          present: presence ?? !isPresent,
          withSms,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPerson(data)
        onRefresh?.()
      }
    } catch (error) {
      console.warn('ERROR_PRESENT_CHANGE_01', error)
    }
  }

  const handleCheckboxChange = async (event) => {
    const newCheckValue = event.target.checked

    if (smsSended) {
      setAwaitingCheckedValue(newCheckValue)
      setOpenModal(true)
    } else {
      await updatePresence(newCheckValue, false)
    }
  }

  // Nom complet formaté
  const fullName = [civilite?.libelle, prenom, nom?.toUpperCase()]
    .filter(Boolean)
    .join(' ') || `${prenom} ${nom?.toUpperCase() || ''}`

  return (
    <>
      {/* Modal de confirmation SMS (garde MUI pour compatibilité) */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-confirmation"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography sx={{ mb: 3 }}>Confirmer cette action ?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <MuiButton
              variant="outlined"
              color="inherit"
              onClick={() => {
                setAwaitingCheckedValue(null)
                setOpenModal(false)
              }}
            >
              Non
            </MuiButton>
            <MuiButton
              variant="contained"
              color="success"
              onClick={() => {
                updatePresence(awaitingCheckedValue, true)
                setOpenModal(false)
              }}
            >
              Oui
            </MuiButton>
          </Box>
        </Box>
      </Modal>

      {/* Carte personne */}
      <Card>
        <CardHeader className="tw:flex-row tw:items-start tw:justify-between tw:space-y-0">
          {/* Badges */}
          <div className="tw:flex tw:flex-wrap tw:gap-2">
            <Badge variant={paymentBadge.variant}>
              <span>{paymentBadge.icon}</span>
              {paymentBadge.label}
            </Badge>
            <Badge variant={table ? 'info' : 'warning'}>
              <Users className="tw:h-3 tw:w-3" />
              {table ? `Table ${table.numero}` : 'Sans table'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="tw:flex tw:gap-1">
            <Button variant="ghost" size="icon" asChild>
              <a href={`/personne/${id}/edit`} title="Modifier">
                <Pencil className="tw:h-4 tw:w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Nom */}
          <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-3">
            {fullName}
          </h3>

          {/* Infos */}
          <div className="tw:grid tw:grid-cols-1 tw:gap-2 tw:text-sm">
            {telephone && (
              <div className="tw:flex tw:items-center tw:gap-2 tw:text-gray-600">
                <Phone className="tw:h-4 tw:w-4 tw:text-gray-400" />
                <a href={`tel:${telephone}`} className="tw:hover:text-blue-600">
                  {telephone}
                </a>
              </div>
            )}
            {email && (
              <div className="tw:flex tw:items-center tw:gap-2 tw:text-gray-600">
                <Mail className="tw:h-4 tw:w-4 tw:text-gray-400" />
                <a
                  href={`mailto:${email}`}
                  className="tw:hover:text-blue-600 tw:truncate"
                  title={email}
                >
                  {email}
                </a>
              </div>
            )}
            {adresse && variant === 'fullpage' && (
              <div className="tw:flex tw:items-start tw:gap-2 tw:text-gray-600">
                <MapPin className="tw:h-4 tw:w-4 tw:text-gray-400 tw:mt-0.5" />
                <span>
                  {adresse}, {codePostal} {ville}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="tw:flex tw:items-center tw:gap-2">
            <Checkbox
              checked={isPresent || false}
              onChange={handleCheckboxChange}
            />
            <span className="tw:text-sm tw:text-gray-600">Présent</span>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
