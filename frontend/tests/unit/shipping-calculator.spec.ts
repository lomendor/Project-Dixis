/**
 * SH-RATE-001, SH-LOCK-002, SH-SURC-003: Shipping Calculator Tests
 * Tests Greek shipping complexity, rate calculations, zone locking, and surcharges
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Types for shipping calculation
interface ShippingDestination {
  postal_code: string;
  region: string;
  island?: boolean;
  remote?: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  base_price: number;
  per_kg_rate: number;
  zone_surcharge: number;
  estimated_days: number;
  restrictions?: string[];
}

interface ShippingQuote {
  method: ShippingMethod;
  final_price: number;
  breakdown: {
    base: number;
    weight: number;
    zone_surcharge: number;
    island_surcharge?: number;
    remote_surcharge?: number;
  };
  estimated_delivery: string;
}

// Mock shipping calculator implementation
class GreekShippingCalculator {
  private static lockCounter = 0; // Static counter for unique lock IDs

  private readonly GREEK_POSTAL_ZONES = {
    'athens_metro': ['10*', '11*', '12*', '13*', '14*', '15*', '16*', '17*', '18*', '19*'],
    'thessaloniki': ['54*', '55*', '56*'],
    'mainland': ['20*', '21*', '22*', '23*', '24*', '25*', '26*', '27*', '28*', '29*', '30*', '31*', '32*', '33*', '34*', '35*', '36*', '37*', '38*', '39*', '40*', '41*', '42*', '43*', '44*', '45*', '46*', '47*', '48*', '49*', '50*', '51*', '52*', '53*', '57*', '58*', '59*', '60*', '61*', '62*'],
    'crete': ['70*', '71*', '72*', '73*', '74*'],
    'islands_large': ['80*', '81*', '82*', '83*', '84*', '85*'],
    'islands_remote': ['86*', '87*', '88*', '89*', '90*', '91*', '92*', '93*', '94*', '95*', '96*', '97*', '98*', '99*']
  };

  private readonly SHIPPING_METHODS: ShippingMethod[] = [
    {
      id: 'acs_standard',
      name: 'ACS Standard',
      base_price: 3.50,
      per_kg_rate: 1.20,
      zone_surcharge: 0,
      estimated_days: 2,
      restrictions: []
    },
    {
      id: 'acs_express',
      name: 'ACS Express',
      base_price: 6.50,
      per_kg_rate: 1.80,
      zone_surcharge: 0,
      estimated_days: 1,
      restrictions: ['no_islands_remote']
    },
    {
      id: 'hellenic_post',
      name: 'ΕΛΤΑ',
      base_price: 2.20,
      per_kg_rate: 0.90,
      zone_surcharge: 0,
      estimated_days: 4,
      restrictions: []
    },
    {
      id: 'speedex',
      name: 'Speedex',
      base_price: 4.00,
      per_kg_rate: 1.40,
      zone_surcharge: 0,
      estimated_days: 2,
      restrictions: ['no_islands_remote']
    }
  ];

  validatePostalCode(postalCode: string): boolean {
    return /^\d{5}$/.test(postalCode) && parseInt(postalCode) >= 10000 && parseInt(postalCode) <= 99999;
  }

  identifyZone(postalCode: string): string {
    const prefix = postalCode.substring(0, 2) + '*';

    for (const [zone, patterns] of Object.entries(this.GREEK_POSTAL_ZONES)) {
      if (patterns.some(pattern => prefix === pattern)) {
        return zone;
      }
    }
    return 'unknown';
  }

  isIsland(postalCode: string): boolean {
    const zone = this.identifyZone(postalCode);
    return ['crete', 'islands_large', 'islands_remote'].includes(zone);
  }

  isRemoteArea(postalCode: string): boolean {
    const zone = this.identifyZone(postalCode);
    return zone === 'islands_remote';
  }

  calculateZoneSurcharge(zone: string): number {
    const surcharges = {
      'athens_metro': 0,
      'thessaloniki': 0.50,
      'mainland': 1.00,
      'crete': 3.50,
      'islands_large': 5.00,
      'islands_remote': 8.50
    };
    return surcharges[zone as keyof typeof surcharges] || 0;
  }

  calculateShippingQuotes(destination: ShippingDestination, weightKg: number = 1): ShippingQuote[] {
    if (!this.validatePostalCode(destination.postal_code)) {
      throw new Error('Μη έγκυρος ταχυδρομικός κώδικας');
    }

    const zone = this.identifyZone(destination.postal_code);
    const isRemote = this.isRemoteArea(destination.postal_code);
    const isIslandArea = this.isIsland(destination.postal_code);

    return this.SHIPPING_METHODS
      .filter(method => {
        // Filter out methods with restrictions for remote islands
        if (isRemote && method.restrictions?.includes('no_islands_remote')) {
          return false;
        }
        return true;
      })
      .map(method => {
        const zoneSurcharge = this.calculateZoneSurcharge(zone);
        const basePrice = method.base_price;
        const weightPrice = method.per_kg_rate * Math.max(weightKg, 1);

        let finalPrice = basePrice + weightPrice + zoneSurcharge;

        // Additional surcharges for special areas
        const breakdown: ShippingQuote['breakdown'] = {
          base: basePrice,
          weight: weightPrice,
          zone_surcharge: zoneSurcharge
        };

        // Island surcharge (separate from zone)
        if (isIslandArea && zone !== 'crete') {
          const islandSurcharge = isRemote ? 5.00 : 2.50;
          finalPrice += islandSurcharge;
          breakdown.island_surcharge = islandSurcharge;
        }

        // Remote area handling surcharge
        if (isRemote) {
          const remoteSurcharge = 3.00;
          finalPrice += remoteSurcharge;
          breakdown.remote_surcharge = remoteSurcharge;
        }

        // Calculate estimated delivery
        let estimatedDays = method.estimated_days;
        if (isRemote) estimatedDays += 3;
        else if (isIslandArea) estimatedDays += 1;

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);

        return {
          method,
          final_price: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
          breakdown,
          estimated_delivery: deliveryDate.toISOString().split('T')[0]
        };
      })
      .sort((a, b) => a.final_price - b.final_price); // Sort by price
  }

  // SH-LOCK-002: Zone locking for bulk orders
  lockShippingRates(postalCode: string, durationHours: number = 24): Promise<{ lock_id: string; expires_at: string }> {
    return new Promise((resolve) => {
      // Use counter + timestamp for uniqueness in concurrent scenarios
      const lockId = `SHIP_${postalCode}_${Date.now()}_${++GreekShippingCalculator.lockCounter}`;
      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      setTimeout(() => {
        resolve({
          lock_id: lockId,
          expires_at: expiresAt.toISOString()
        });
      }, 100); // Simulate API delay
    });
  }

  // SH-SURC-003: Dynamic surcharge calculation
  calculateDynamicSurcharges(postalCode: string, orderValue: number, seasonalMultiplier: number = 1.0): number {
    const zone = this.identifyZone(postalCode);
    const isRemote = this.isRemoteArea(postalCode);

    let surcharge = 0;

    // Peak season surcharge (Christmas, Easter)
    if (seasonalMultiplier > 1.0) {
      surcharge += 2.50 * seasonalMultiplier;
    }

    // High-value order insurance surcharge
    if (orderValue > 100) {
      surcharge += orderValue * 0.005; // 0.5% insurance
    }

    // Remote handling fee
    if (isRemote) {
      surcharge += Math.min(orderValue * 0.02, 15.00); // 2% up to €15
    }

    return Math.round(surcharge * 100) / 100;
  }
}

describe('SH-RATE-001: Greek Shipping Rate Calculation', () => {
  let calculator: GreekShippingCalculator;

  beforeEach(() => {
    calculator = new GreekShippingCalculator();
  });

  describe('Postal Code Validation', () => {
    it('validates correct Greek postal codes', () => {
      expect(calculator.validatePostalCode('10671')).toBe(true); // Athens
      expect(calculator.validatePostalCode('54622')).toBe(true); // Thessaloniki
      expect(calculator.validatePostalCode('71201')).toBe(true); // Heraklion, Crete
    });

    it('rejects invalid postal codes', () => {
      expect(calculator.validatePostalCode('1067')).toBe(false); // Too short
      expect(calculator.validatePostalCode('106711')).toBe(false); // Too long
      expect(calculator.validatePostalCode('00000')).toBe(false); // Invalid range
      expect(calculator.validatePostalCode('abcde')).toBe(false); // Non-numeric
    });
  });

  describe('Zone Identification', () => {
    it('correctly identifies Athens metro area', () => {
      expect(calculator.identifyZone('10671')).toBe('athens_metro');
      expect(calculator.identifyZone('11851')).toBe('athens_metro');
      expect(calculator.identifyZone('19010')).toBe('athens_metro');
    });

    it('correctly identifies Thessaloniki', () => {
      expect(calculator.identifyZone('54622')).toBe('thessaloniki');
      expect(calculator.identifyZone('55535')).toBe('thessaloniki');
    });

    it('correctly identifies Greek islands', () => {
      expect(calculator.identifyZone('71201')).toBe('crete'); // Heraklion
      expect(calculator.identifyZone('81100')).toBe('islands_large'); // Mytilene
      expect(calculator.identifyZone('86100')).toBe('islands_remote'); // Karpathos
    });
  });

  describe('Rate Calculation for Different Zones', () => {
    it('calculates correct rates for Athens (no surcharge)', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '10671', region: 'Attica' }, 1);

      expect(quotes).toHaveLength(4); // All methods available
      const acsStandard = quotes.find(q => q.method.id === 'acs_standard');
      expect(acsStandard?.final_price).toBe(4.70); // 3.50 base + 1.20 weight + 0 surcharge
      expect(acsStandard?.breakdown.zone_surcharge).toBe(0);
    });

    it('calculates correct rates for Thessaloniki (small surcharge)', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '54622', region: 'Macedonia' }, 1);

      const acsStandard = quotes.find(q => q.method.id === 'acs_standard');
      expect(acsStandard?.final_price).toBe(5.20); // 3.50 base + 1.20 weight + 0.50 surcharge
      expect(acsStandard?.breakdown.zone_surcharge).toBe(0.50);
    });

    it('calculates correct rates for Crete (island surcharge)', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '71201', region: 'Crete' }, 1);

      const acsStandard = quotes.find(q => q.method.id === 'acs_standard');
      expect(acsStandard?.final_price).toBe(8.20); // 3.50 base + 1.20 weight + 3.50 zone
      expect(acsStandard?.breakdown.zone_surcharge).toBe(3.50);
    });

    it('calculates correct rates for remote islands (multiple surcharges)', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '86100', region: 'Dodecanese' }, 1);

      expect(quotes).toHaveLength(2); // Only methods without island restrictions
      const hellenicPost = quotes.find(q => q.method.id === 'hellenic_post');

      // Base: 2.20, Weight: 0.90, Zone: 8.50, Island: 5.00, Remote: 3.00 = 19.60
      expect(hellenicPost?.final_price).toBe(19.60);
      expect(hellenicPost?.breakdown.zone_surcharge).toBe(8.50);
      expect(hellenicPost?.breakdown.island_surcharge).toBe(5.00);
      expect(hellenicPost?.breakdown.remote_surcharge).toBe(3.00);
    });
  });

  describe('Weight-based Pricing', () => {
    it('calculates correct rates for heavy packages', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '10671', region: 'Attica' }, 5);

      const acsStandard = quotes.find(q => q.method.id === 'acs_standard');
      expect(acsStandard?.final_price).toBe(9.50); // 3.50 base + (1.20 * 5) weight + 0 surcharge
      expect(acsStandard?.breakdown.weight).toBe(6.00);
    });

    it('enforces minimum 1kg for calculation', () => {
      const quotes = calculator.calculateShippingQuotes({ postal_code: '10671', region: 'Attica' }, 0.5);

      const acsStandard = quotes.find(q => q.method.id === 'acs_standard');
      expect(acsStandard?.breakdown.weight).toBe(1.20); // Minimum 1kg applied
    });
  });

  describe('Delivery Time Estimation', () => {
    it('adds correct delivery delays for islands', () => {
      const quotesAthens = calculator.calculateShippingQuotes({ postal_code: '10671', region: 'Attica' }, 1);
      const quotesRemote = calculator.calculateShippingQuotes({ postal_code: '86100', region: 'Dodecanese' }, 1);

      const acsAthens = quotesAthens.find(q => q.method.id === 'acs_standard');
      const hellenicRemote = quotesRemote.find(q => q.method.id === 'hellenic_post');

      const athensDate = new Date(acsAthens!.estimated_delivery);
      const remoteDate = new Date(hellenicRemote!.estimated_delivery);

      // Remote should be 3 days later than base (4 + 3 = 7 days from now)
      const daysDiff = Math.floor((remoteDate.getTime() - athensDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(5); // 7 days vs 2 days
    });
  });
});

describe('SH-LOCK-002: Shipping Rate Locking', () => {
  let calculator: GreekShippingCalculator;

  beforeEach(() => {
    calculator = new GreekShippingCalculator();
  });

  it('creates shipping rate locks for bulk orders', async () => {
    const lock = await calculator.lockShippingRates('10671', 24);

    expect(lock.lock_id).toMatch(/^SHIP_10671_\d+_\d+$/); // Updated regex to include counter
    expect(new Date(lock.expires_at)).toBeInstanceOf(Date);

    const expiryTime = new Date(lock.expires_at).getTime();
    const expectedExpiry = Date.now() + (24 * 60 * 60 * 1000);
    expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(5000); // Within 5 seconds
  });

  it('supports custom lock duration', async () => {
    const lock = await calculator.lockShippingRates('54622', 48);

    const expiryTime = new Date(lock.expires_at).getTime();
    const expectedExpiry = Date.now() + (48 * 60 * 60 * 1000);
    expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(5000);
  });

  it('generates unique lock IDs for concurrent requests', async () => {
    const [lock1, lock2, lock3] = await Promise.all([
      calculator.lockShippingRates('10671'),
      calculator.lockShippingRates('10671'),
      calculator.lockShippingRates('10671')
    ]);

    expect(lock1.lock_id).not.toBe(lock2.lock_id);
    expect(lock2.lock_id).not.toBe(lock3.lock_id);
    expect(lock1.lock_id).not.toBe(lock3.lock_id);
  });
});

describe('SH-SURC-003: Dynamic Surcharge Calculation', () => {
  let calculator: GreekShippingCalculator;

  beforeEach(() => {
    calculator = new GreekShippingCalculator();
  });

  it('calculates seasonal surcharges correctly', () => {
    // Normal season
    const normalSurcharge = calculator.calculateDynamicSurcharges('10671', 50, 1.0);
    expect(normalSurcharge).toBe(0);

    // Peak season (Christmas: 1.5x multiplier)
    const peakSurcharge = calculator.calculateDynamicSurcharges('10671', 50, 1.5);
    expect(peakSurcharge).toBe(3.75); // 2.50 * 1.5
  });

  it('calculates insurance surcharges for high-value orders', () => {
    // Low value order
    const lowValueSurcharge = calculator.calculateDynamicSurcharges('10671', 50);
    expect(lowValueSurcharge).toBe(0);

    // High value order
    const highValueSurcharge = calculator.calculateDynamicSurcharges('10671', 200);
    expect(highValueSurcharge).toBe(1.00); // 200 * 0.005
  });

  it('calculates remote area handling surcharges', () => {
    // Mainland
    const mainlandSurcharge = calculator.calculateDynamicSurcharges('10671', 150);
    expect(mainlandSurcharge).toBe(0.75); // 150 * 0.005 insurance only

    // Remote island
    const remoteSurcharge = calculator.calculateDynamicSurcharges('86100', 150);
    expect(remoteSurcharge).toBe(3.75); // 0.75 insurance + 3.00 remote (150 * 0.02)
  });

  it('caps remote surcharge at maximum amount', () => {
    // Very high value order
    const cappedSurcharge = calculator.calculateDynamicSurcharges('86100', 1000);
    expect(cappedSurcharge).toBe(20.00); // 5.00 insurance + 15.00 remote (capped)
  });

  it('combines all surcharge types correctly', () => {
    // Peak season + high value + remote area
    const combinedSurcharge = calculator.calculateDynamicSurcharges('86100', 300, 2.0);

    // Expected: (2.50 * 2.0) seasonal + (300 * 0.005) insurance + (300 * 0.02) remote
    // = 5.00 + 1.50 + 6.00 = 12.50
    expect(combinedSurcharge).toBe(12.50);
  });
});