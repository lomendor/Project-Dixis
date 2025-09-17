# Shipping v1.1 - Offline Rate Tables

**Version**: 1.1
**Date**: 2025-09-17
**Status**: ✅ Implemented

## Overview

Shipping v1.1 introduces **offline rate tables** for accurate shipping cost calculations without external courier APIs. This system provides zone-based pricing with step rates, island multipliers, and remote area surcharges for Greece.

## Key Features

### ✅ Configuration-Driven Rates
- No external API dependencies
- JSON-based rate tables for easy management
- Zone-based pricing with postal code mapping
- Remote area detection and surcharges

### ✅ Advanced Pricing Logic
- **Step-based rates**: Different pricing tiers (0-2kg, 2-5kg, 5kg+)
- **Island multipliers**: Higher costs for island destinations
- **Remote surcharges**: Additional fees for hard-to-reach areas
- **Volumetric weight**: Billing based on dimensional weight when higher

### ✅ Admin Interface
- Read-only rate viewing interface
- Live simulation with test scenarios
- Zone information and configuration display

## Configuration Files

### 1. Rate Tables (`config/shipping/rates.gr.json`)

**Structure**:
```json
{
  "version": "2025-09-17",
  "carriers": ["INTERNAL_STANDARD"],
  "zones": ["GR_ATTICA", "GR_THESSALONIKI", "GR_MAINLAND", "GR_CRETE", "GR_ISLANDS_LARGE", "GR_ISLANDS_SMALL", "GR_REMOTE"],
  "tables": {
    "INTERNAL_STANDARD": {
      "GR_ATTICA": {
        "base_until_2kg": 2.90,
        "step_kg_2_5": 0.90,
        "step_kg_over_5": 0.70,
        "remote_surcharge": 0,
        "island_multiplier": 1.00,
        "estimated_delivery_days": 1,
        "max_weight_kg": 30
      }
    }
  },
  "postal_code_mapping": {
    "GR_ATTICA": ["10*", "11*", "12*", "13*", "14*", "15*", "16*", "17*", "18*", "19*"]
  }
}
```

**Zones**:
- **GR_ATTICA**: Athens metropolitan area (1-day delivery)
- **GR_THESSALONIKI**: Thessaloniki metropolitan area (2-day delivery)
- **GR_MAINLAND**: Mainland Greece (3-day delivery)
- **GR_CRETE**: Crete island (4-day delivery, 1.15x multiplier)
- **GR_ISLANDS_LARGE**: Large islands (5-day delivery, 1.20x multiplier)
- **GR_ISLANDS_SMALL**: Small islands (7-day delivery, 1.30x multiplier)
- **GR_REMOTE**: Remote areas (6-day delivery, 1.25x multiplier, 3.00 EUR surcharge)

### 2. Remote Postal Codes (`config/shipping/remote_postal_codes.json`)

**Purpose**: Defines specific postal codes that require special handling and zone overrides.

**Structure**:
```json
{
  "version": "2025-09-17",
  "remote_postal_codes": ["19007", "19008", "19009", "84001", ...],
  "remote_areas": {
    "19007": {
      "name": "Κυθήρων - Kythira Remote",
      "description": "Remote areas of Kythira island",
      "zone_override": "GR_REMOTE"
    }
  }
}
```

## Rate Calculation Logic

### Step 1: Zone Detection
```php
// Priority order:
1. Check if postal code in remote_postal_codes list
2. If found, use zone_override from remote_areas
3. Otherwise, use postal_code_mapping from rate tables
4. Default to GR_MAINLAND if no match
```

### Step 2: Weight Calculation
```php
// Volumetric weight
$volumetricWeight = (length * width * height) / volumetric_divisor;

// Billable weight (higher of actual or volumetric)
$billableWeight = max($actualWeight, $volumetricWeight);
```

### Step 3: Cost Calculation
```php
if ($billableWeight <= 2) {
    $cost = $rateTable['base_until_2kg'];
} elseif ($billableWeight <= 5) {
    $cost = $rateTable['base_until_2kg'] + (($billableWeight - 2) * $rateTable['step_kg_2_5']);
} else {
    $cost2to5 = 3 * $rateTable['step_kg_2_5']; // 3kg from 2-5kg
    $costOver5 = ($billableWeight - 5) * $rateTable['step_kg_over_5'];
    $cost = $rateTable['base_until_2kg'] + $cost2to5 + $costOver5;
}

// Apply island multiplier
$cost *= $rateTable['island_multiplier'];

// Apply remote surcharge
$cost += $rateTable['remote_surcharge'];
```

## API Endpoints

### Public Shipping Quote
```bash
POST /api/v1/shipping/quote
```

**Request**:
```json
{
  "items": [
    {"product_id": 1, "quantity": 2}
  ],
  "postal_code": "10431"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cost_cents": 290,
    "cost_eur": 2.90,
    "zone_code": "GR_ATTICA",
    "zone_name": "Αττική - Athens Metropolitan Area",
    "carrier_code": "ELTA",
    "estimated_delivery_days": 1,
    "breakdown": {
      "base_rate": 2.90,
      "extra_weight_kg": 0,
      "extra_cost": 0,
      "island_multiplier": 1.0,
      "remote_surcharge": 0,
      "billable_weight_kg": 1.0,
      "actual_weight_kg": 1.0,
      "volumetric_weight_kg": 1.0,
      "postal_code": "10431"
    }
  }
}
```

### Admin Rate Tables Interface

#### View Rate Tables
```bash
GET /api/admin/shipping/rates
Authorization: Bearer {token}
```

#### View Zone Configuration
```bash
GET /api/admin/shipping/zones
Authorization: Bearer {token}
```

#### Simulate Rate Calculations
```bash
GET /api/admin/shipping/simulate
Authorization: Bearer {token}
```

## Usage Examples

### Example 1: Athens Light Package (1kg)
- **Postal Code**: 10431
- **Zone**: GR_ATTICA
- **Weight**: 1kg (≤ 2kg tier)
- **Cost**: 2.90 EUR (base rate only)
- **Delivery**: 1 day

### Example 2: Crete Medium Package (3kg)
- **Postal Code**: 71201
- **Zone**: GR_CRETE
- **Weight**: 3kg (2-5kg tier)
- **Calculation**: 4.50 + (1kg × 1.35) = 5.85 EUR
- **Island Multiplier**: 5.85 × 1.15 = 6.73 EUR
- **Delivery**: 4 days

### Example 3: Remote Area (Kythira, 2kg)
- **Postal Code**: 19007
- **Zone**: GR_REMOTE (override)
- **Weight**: 2kg (base tier)
- **Calculation**: 8.50 EUR (base)
- **Island Multiplier**: 8.50 × 1.25 = 10.63 EUR
- **Remote Surcharge**: 10.63 + 3.00 = 13.63 EUR
- **Delivery**: 6 days

### Example 4: Heavy Package to Small Island (8kg)
- **Postal Code**: 87001
- **Zone**: GR_ISLANDS_SMALL
- **Weight**: 8kg (>5kg tier)
- **Calculation**:
  - Base: 9.80 EUR
  - Step 2-5kg: 3kg × 2.80 = 8.40 EUR
  - Step >5kg: 3kg × 2.20 = 6.60 EUR
  - Subtotal: 24.80 EUR
  - Island Multiplier: 24.80 × 1.30 = 32.24 EUR
- **Delivery**: 7 days

## Implementation Details

### ShippingService Updates
- **loadConfiguration()**: Loads rate tables and remote postal codes
- **getZoneByPostalCode()**: Prioritizes remote area detection
- **calculateShippingCost()**: Uses new step-based pricing structure
- **computeVolumetricWeight()**: Uses configurable volumetric divisor

### Test Coverage
- **Unit Tests**: Rate calculation logic, zone detection, weight tiers
- **Feature Tests**: End-to-end API testing with all postal codes and zones
- **Admin Tests**: Interface functionality and simulation endpoints

### Configuration Management
- **Versioned**: All config files include version and last_updated metadata
- **Source Tracked**: Metadata includes data source information
- **Calibration Notes**: Built-in reminders for periodic rate adjustments

## Migration from External APIs

The offline rate tables provide several advantages over external courier APIs:

1. **Reliability**: No network dependencies or API downtime
2. **Performance**: Instant calculations without HTTP requests
3. **Cost Control**: No per-request API fees
4. **Accuracy**: Rates calibrated based on actual order data
5. **Predictability**: Consistent pricing regardless of external factors

## Maintenance

### Rate Updates
Rate tables should be updated periodically based on:
- Actual delivery costs analysis
- Market rate changes
- Seasonal adjustments
- Fuel surcharge variations

### Monitoring
Monitor the following metrics:
- Average shipping cost vs actual delivery cost
- Zone-specific profitability
- Remote area delivery success rates
- Customer satisfaction with delivery times

## Security Considerations

- Admin endpoints require authentication
- Rate viewing is read-only (no modification APIs)
- Configuration files are version controlled
- No sensitive data exposure in public endpoints

## Performance Impact

- **Positive**: Eliminates external API latency
- **Minimal**: JSON file loading on service instantiation
- **Optimized**: In-memory calculations after initial load
- **Scalable**: No per-request network overhead

## Future Enhancements

Potential v1.2 features:
- Dynamic rate adjustment based on order analytics
- Seasonal rate multipliers
- Express delivery options
- International shipping zones
- Bulk discount tiers
- Producer-specific rate overrides