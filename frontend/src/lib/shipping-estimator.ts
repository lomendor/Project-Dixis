/**
 * Shipping Estimator for Greek postal code tiers
 * Provides hardcoded shipping cost calculation based on weight and postal code
 */

export interface ShippingQuote {
  costCents: number;
  label: string;
  estimatedDays: number;
  carrier: string;
}

interface ShippingTier {
  weightRangeKg: [number, number];
  baseCostCents: number;
  additionalPerKgCents: number;
}

/**
 * Greek postal code regions for shipping calculation
 */
const POSTAL_CODE_REGIONS = {
  ATHENS_METRO: {
    name: 'Αθήνα & Περιφέρεια',
    prefixes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    multiplier: 1.0,
  },
  THESSALONIKI_METRO: {
    name: 'Θεσσαλονίκη & Περιφέρεια',
    prefixes: ['54', '55', '56', '57', '58', '59'],
    multiplier: 1.1,
  },
  MAJOR_CITIES: {
    name: 'Μεγάλες Πόλεις',
    prefixes: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'],
    multiplier: 1.2,
  },
  ISLANDS: {
    name: 'Νησιά',
    prefixes: ['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
    multiplier: 1.5,
  },
  REMOTE_AREAS: {
    name: 'Απομακρυσμένες Περιοχές',
    prefixes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75'],
    multiplier: 1.3,
  },
};

/**
 * Base shipping tiers by weight
 */
const SHIPPING_TIERS: ShippingTier[] = [
  {
    weightRangeKg: [0, 2],
    baseCostCents: 350, // €3.50 base for up to 2kg
    additionalPerKgCents: 0,
  },
  {
    weightRangeKg: [2, 5],
    baseCostCents: 450, // €4.50 base for 2-5kg
    additionalPerKgCents: 50, // €0.50 per additional kg
  },
  {
    weightRangeKg: [5, 10],
    baseCostCents: 650, // €6.50 base for 5-10kg
    additionalPerKgCents: 75, // €0.75 per additional kg
  },
  {
    weightRangeKg: [10, 20],
    baseCostCents: 950, // €9.50 base for 10-20kg
    additionalPerKgCents: 100, // €1.00 per additional kg
  },
  {
    weightRangeKg: [20, Infinity],
    baseCostCents: 1450, // €14.50 base for 20kg+
    additionalPerKgCents: 125, // €1.25 per additional kg
  },
];

/**
 * Get region multiplier based on postal code
 */
function getRegionMultiplier(postalCode: string): { multiplier: number; regionName: string } {
  // Clean postal code (remove spaces, keep only first 2 digits)
  const cleanCode = postalCode.replace(/\s+/g, '').substring(0, 2);

  for (const [key, region] of Object.entries(POSTAL_CODE_REGIONS)) {
    if (region.prefixes.some(prefix => cleanCode.startsWith(prefix))) {
      return {
        multiplier: region.multiplier,
        regionName: region.name,
      };
    }
  }

  // Default to major cities if not found
  return {
    multiplier: POSTAL_CODE_REGIONS.MAJOR_CITIES.multiplier,
    regionName: 'Λοιπές Περιοχές',
  };
}

/**
 * Calculate shipping tier based on weight
 */
function calculateBaseCost(totalWeightGrams: number): { costCents: number; tier: ShippingTier } {
  const weightKg = totalWeightGrams / 1000;

  for (const tier of SHIPPING_TIERS) {
    const [minWeight, maxWeight] = tier.weightRangeKg;

    if (weightKg <= maxWeight) {
      let cost = tier.baseCostCents;

      // Add additional cost for weight over the minimum
      if (weightKg > minWeight) {
        const additionalWeight = weightKg - minWeight;
        cost += Math.ceil(additionalWeight) * tier.additionalPerKgCents;
      }

      return { costCents: cost, tier };
    }
  }

  // Fallback for very heavy items
  const heavyTier = SHIPPING_TIERS[SHIPPING_TIERS.length - 1];
  const weightKgOverBase = weightKg - heavyTier.weightRangeKg[0];
  const cost = heavyTier.baseCostCents + Math.ceil(weightKgOverBase) * heavyTier.additionalPerKgCents;

  return { costCents: cost, tier: heavyTier };
}

/**
 * Get estimated delivery days based on region
 */
function getEstimatedDeliveryDays(regionMultiplier: number): number {
  if (regionMultiplier <= 1.1) return 2; // Athens/Thessaloniki: 2 days
  if (regionMultiplier <= 1.3) return 3; // Major cities/Remote: 3 days
  return 4; // Islands: 4 days
}

/**
 * Get carrier name based on region and weight
 */
function getCarrier(regionName: string, weightKg: number): string {
  if (regionName.includes('Νησιά')) {
    return 'ΕΛΤΑ Courier (Νησιωτικές Περιοχές)';
  }

  if (weightKg > 10) {
    return 'ΕΛΤΑ Freight';
  }

  return 'ΕΛΤΑ Courier';
}

/**
 * Main function to get shipping quote
 */
export function getShippingQuote(
  totalWeightGrams: number,
  postalCode: string
): ShippingQuote {
  // Validate inputs
  if (totalWeightGrams <= 0) {
    throw new Error('Weight must be greater than 0');
  }

  if (!postalCode || postalCode.length < 2) {
    throw new Error('Valid postal code is required');
  }

  // Calculate base cost
  const { costCents: baseCostCents, tier } = calculateBaseCost(totalWeightGrams);

  // Get region multiplier
  const { multiplier, regionName } = getRegionMultiplier(postalCode);

  // Calculate final cost
  const finalCostCents = Math.round(baseCostCents * multiplier);

  // Get estimated delivery
  const estimatedDays = getEstimatedDeliveryDays(multiplier);

  // Get carrier
  const carrier = getCarrier(regionName, totalWeightGrams / 1000);

  // Build label
  const weightKg = (totalWeightGrams / 1000).toFixed(1);
  const label = `Αποστολή στη ${regionName} (${weightKg}kg)`;

  return {
    costCents: finalCostCents,
    label,
    estimatedDays,
    carrier,
  };
}

/**
 * Get shipping quote with error handling
 */
export async function getShippingQuoteAsync(
  totalWeightGrams: number,
  postalCode: string
): Promise<ShippingQuote> {
  try {
    return getShippingQuote(totalWeightGrams, postalCode);
  } catch (error) {
    console.error('Shipping quote calculation error:', error);
    throw new Error('Δεν ήταν δυνατός ο υπολογισμός των εξόδων αποστολής');
  }
}

/**
 * Validate Greek postal code format
 */
export function validateGreekPostalCode(postalCode: string): boolean {
  const cleanCode = postalCode.replace(/\s+/g, '');
  return /^[0-9]{5}$/.test(cleanCode);
}

/**
 * Get all available regions for reference
 */
export function getShippingRegions() {
  return Object.entries(POSTAL_CODE_REGIONS).map(([key, region]) => ({
    id: key,
    name: region.name,
    prefixes: region.prefixes,
    multiplier: region.multiplier,
  }));
}