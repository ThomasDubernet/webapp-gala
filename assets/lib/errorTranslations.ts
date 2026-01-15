/**
 * Error message translations from English API errors to French user-friendly messages
 */

interface ErrorPattern {
  pattern: RegExp;
  message: string | ((matches: RegExpMatchArray) => string);
}

/**
 * Field name translations
 */
const fieldTranslations: Record<string, string> = {
  nom: 'nom',
  prenom: 'prénom',
  email: 'email',
  telephone: 'téléphone',
  adresse: 'adresse',
  codePostal: 'code postal',
  ville: 'ville',
  civilite: 'civilité',
  table: 'table',
  categorie: 'catégorie',
  present: 'présent',
  paye: 'payé',
  numero: 'numéro',
  capacite: 'capacité',
  posX: 'position X',
  posY: 'position Y',
  evenement: 'événement',
  conjoint: 'conjoint',
  nbPersonnes: 'nombre de personnes',
  montant: 'montant',
  smsSended: 'SMS envoyé',
};

/**
 * Get translated field name
 */
function translateField(field: string): string {
  return fieldTranslations[field] || field;
}

/**
 * Error patterns and their French translations
 */
const errorPatterns: ErrorPattern[] = [
  // Denormalization errors (type mismatch)
  {
    pattern: /Failed to denormalize attribute "(\w+)" value.*Expected argument of type "(\w+)", "(\w+)" given/i,
    message: (matches) => {
      const field = translateField(matches[1]);
      const expectedType = matches[2];
      const givenType = matches[3];

      const typeTranslations: Record<string, string> = {
        string: 'texte',
        int: 'nombre entier',
        integer: 'nombre entier',
        float: 'nombre décimal',
        bool: 'booléen',
        boolean: 'booléen',
        array: 'liste',
        null: 'vide',
      };

      const expectedFr = typeTranslations[expectedType] || expectedType;
      const givenFr = typeTranslations[givenType] || givenType;

      if (givenType === 'null') {
        return `Le champ "${field}" est requis et ne peut pas être vide.`;
      }
      return `Le champ "${field}" doit être de type ${expectedFr}, mais une valeur de type ${givenFr} a été fournie.`;
    },
  },

  // Validation errors - blank/empty
  {
    pattern: /This value should not be blank/i,
    message: 'Ce champ est requis.',
  },
  {
    pattern: /This value should not be null/i,
    message: 'Ce champ est requis.',
  },

  // Validation errors - email
  {
    pattern: /This value is not a valid email address/i,
    message: "L'adresse email n'est pas valide.",
  },

  // Validation errors - length
  {
    pattern: /This value is too short\. It should have (\d+) characters? or more/i,
    message: (matches) => `Ce champ doit contenir au moins ${matches[1]} caractère(s).`,
  },
  {
    pattern: /This value is too long\. It should have (\d+) characters? or less/i,
    message: (matches) => `Ce champ doit contenir au maximum ${matches[1]} caractère(s).`,
  },

  // Validation errors - numeric
  {
    pattern: /This value should be positive/i,
    message: 'Cette valeur doit être positive.',
  },
  {
    pattern: /This value should be greater than (\d+)/i,
    message: (matches) => `Cette valeur doit être supérieure à ${matches[1]}.`,
  },
  {
    pattern: /This value should be less than (\d+)/i,
    message: (matches) => `Cette valeur doit être inférieure à ${matches[1]}.`,
  },
  {
    pattern: /This value should be between (\d+) and (\d+)/i,
    message: (matches) => `Cette valeur doit être comprise entre ${matches[1]} et ${matches[2]}.`,
  },

  // Validation errors - unique
  {
    pattern: /This value is already used/i,
    message: 'Cette valeur est déjà utilisée.',
  },

  // Validation errors - phone
  {
    pattern: /This value is not a valid phone number/i,
    message: "Le numéro de téléphone n'est pas valide.",
  },

  // Entity not found
  {
    pattern: /Item not found/i,
    message: "L'élément demandé n'a pas été trouvé.",
  },
  {
    pattern: /Unable to find.*entity/i,
    message: "L'élément demandé n'existe pas ou a été supprimé.",
  },

  // Access denied
  {
    pattern: /Access Denied/i,
    message: "Vous n'avez pas les droits pour effectuer cette action.",
  },

  // Invalid IRI (API Platform)
  {
    pattern: /Invalid IRI/i,
    message: 'Référence invalide. Veuillez réessayer.',
  },

  // Network/Server errors
  {
    pattern: /Invalid JSON response/i,
    message: 'Erreur de communication avec le serveur. Veuillez réessayer.',
  },
  {
    pattern: /API error: 500/i,
    message: 'Erreur serveur. Veuillez réessayer ou contacter le support.',
  },
  {
    pattern: /API error: 404/i,
    message: "La ressource demandée n'a pas été trouvée.",
  },
  {
    pattern: /API error: 403/i,
    message: "Vous n'avez pas les droits pour accéder à cette ressource.",
  },
  {
    pattern: /API error: 400/i,
    message: 'Données invalides. Veuillez vérifier les informations saisies.',
  },

  // Database errors
  {
    pattern: /Integrity constraint violation/i,
    message: "Impossible d'effectuer cette action car des données liées existent.",
  },
  {
    pattern: /SQLSTATE/i,
    message: 'Erreur de base de données. Veuillez réessayer ou contacter le support.',
  },

  // General property path errors
  {
    pattern: /at property path "(\w+)"/i,
    message: (matches) => {
      const field = translateField(matches[1]);
      return `Erreur sur le champ "${field}".`;
    },
  },
];

/**
 * Translate an API error message to French
 */
export function translateError(message: string): string {
  // Check each pattern
  for (const { pattern, message: translation } of errorPatterns) {
    const matches = message.match(pattern);
    if (matches) {
      if (typeof translation === 'function') {
        return translation(matches);
      }
      return translation;
    }
  }

  // If no pattern matched, return a generic message for technical errors
  // but keep the original if it looks like a user-friendly message already
  if (
    message.includes('Failed to') ||
    message.includes('Exception') ||
    message.includes('Error:') ||
    message.includes('SQLSTATE') ||
    /^[A-Z][a-z]+[A-Z]/.test(message) // CamelCase technical messages
  ) {
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  return message;
}

/**
 * Translate multiple error messages (for validation errors with multiple fields)
 */
export function translateErrors(messages: string[]): string[] {
  return messages.map(translateError);
}

export default translateError;
