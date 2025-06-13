import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fonction utilitaire pour fusionner les classes CSS de manière intelligente
 * Combine clsx et tailwind-merge pour gérer les classes conditionnelles et les conflits
 * @param {...ClassValue[]} inputs - Liste des classes CSS à fusionner
 * @returns {string} - Chaîne de classes CSS fusionnées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
