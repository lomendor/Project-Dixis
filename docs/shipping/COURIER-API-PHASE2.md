# 🚚 COURIER API PHASE 2 - INTEGRATION STRATEGY

**Status**: 📋 Planning Phase
**Target**: ACS Sandbox Integration + Provider Abstraction
**Timeline**: 6-day development cycle
**Risk Level**: 🟡 MEDIUM - External API dependencies, real-world testing required

---

## 🎯 OBJECTIVES

### Primary Goal
Integrate ACS courier sandbox API for **real shipping label generation** and **tracking**, replacing current PDF stub implementation while maintaining 100% backward compatibility.

### Secondary Goals
- Establish **provider abstraction pattern** for future courier integrations (ELTA, Speedex)
- Implement **robust error handling** and **retry mechanisms** for external API failures
- Maintain **sub-2s response times** for shipping operations
- Ensure **zero downtime deployment** with feature flags

---

## 🗺️ TARGET COURIER PROVIDERS

### Phase 2A: ACS Courier (Primary Target)
```
Provider: ACS Courier
Environment: Sandbox
API Documentation: https://developer.acs.gr/
Authentication: API Key + Basic Auth
Endpoints:
  - POST /api/v1/shipments - Create shipping label
  - GET /api/v1/shipments/{tracking_code} - Get tracking info
  - GET /api/v1/zones - Get delivery zones
Rate Limits: 100 req/min (sandbox), 1000 req/min (production)
```

### Phase 2B: Future Providers (Roadmap)
- **ELTA Courier**: Greece's national postal service
- **Speedex**: Premium courier service
- **Custom Providers**: Regional/specialized couriers

---

## 🏗️ TECHNICAL ARCHITECTURE

### Provider Abstraction Pattern
```php
interface CourierProviderInterface
{
    public function createLabel(ShippingRequest $request): ShippingLabel;
    public function getTracking(string $trackingCode): TrackingInfo;
    public function validateAddress(Address $address): AddressValidation;
    public function getZones(): array;
    public function cancelShipment(string $trackingCode): bool;
}

class AcsCourierProvider implements CourierProviderInterface
{
    // ACS-specific implementation
}

class InternalCourierProvider implements CourierProviderInterface
{
    // Current PDF stub implementation (fallback)
}
```

### Data Mapping Strategy
```json
{
  "internal_carrier_codes": {
    "ELTA": "acs_service_type_1",
    "ACS": "acs_service_type_2",
    "SPEEDEX": "acs_service_type_3"
  },
  "status_mapping": {
    "ACS_PENDING": "pending",
    "ACS_DISPATCHED": "shipped",
    "ACS_IN_TRANSIT": "in_transit",
    "ACS_DELIVERED": "delivered",
    "ACS_FAILED": "failed"
  }
}
```

---

## 🔒 SECURITY & AUTHENTICATION

### ACS API Authentication
```env
ACS_API_BASE=https://sandbox-api.acs.gr/v1
ACS_API_KEY=sandbox_api_key_here
ACS_CLIENT_ID=client_id_here
ACS_CLIENT_SECRET=client_secret_here
```

### Security Measures
- **API Key Rotation**: Monthly rotation schedule
- **IP Whitelisting**: Production server IPs only
- **Request Signing**: HMAC-SHA256 for sensitive operations
- **Rate Limiting**: Client-side throttling + exponential backoff
- **Audit Logging**: All courier API calls logged with request/response

---

## 🔄 IDEMPOTENCY & RETRY STRATEGY

### Idempotency Implementation
```php
class CourierRequestManager
{
    public function createLabelWithRetry(ShippingRequest $request): ShippingLabel
    {
        $idempotencyKey = $this->generateIdempotencyKey($request);

        // Check if label already created
        if ($existing = $this->getExistingLabel($idempotencyKey)) {
            return $existing;
        }

        return $this->executeWithRetry(function() use ($request) {
            return $this->provider->createLabel($request);
        }, $maxRetries = 3);
    }

    private function executeWithRetry(callable $operation, int $maxRetries): mixed
    {
        $attempts = 0;
        while ($attempts < $maxRetries) {
            try {
                return $operation();
            } catch (TemporaryFailureException $e) {
                $attempts++;
                sleep(pow(2, $attempts)); // Exponential backoff
            }
        }
        throw new CourierServiceUnavailableException();
    }
}
```

### Retry Logic
- **Immediate Retry**: 4xx client errors (fix and retry once)
- **Exponential Backoff**: 5xx server errors (2s, 4s, 8s delays)
- **Circuit Breaker**: Disable provider after 5 consecutive failures
- **Fallback**: Switch to internal PDF stub when all providers fail

---

## 📋 ERROR TAXONOMY & HANDLING

### ACS API Error Classification
```
4xx Client Errors:
├── 400 Bad Request → Fix validation and retry once
├── 401 Unauthorized → Refresh auth token and retry
├── 403 Forbidden → Log security alert, use fallback
├── 404 Not Found → Resource doesn't exist, fail fast
├── 422 Validation Error → Fix data format and retry once
└── 429 Rate Limited → Exponential backoff (30s, 60s, 120s)

5xx Server Errors:
├── 500 Internal Error → Retry with backoff (3 attempts)
├── 502 Bad Gateway → Retry with backoff (3 attempts)
├── 503 Service Unavailable → Circuit breaker, use fallback
└── 504 Gateway Timeout → Retry with longer timeout
```

### Error Response Strategy
```php
class CourierErrorHandler
{
    public function handleError(CourierException $e): ShippingResponse
    {
        switch ($e->getType()) {
            case 'VALIDATION_ERROR':
                return $this->fixValidationAndRetry($e);
            case 'RATE_LIMITED':
                return $this->scheduleDelayedRetry($e);
            case 'SERVICE_UNAVAILABLE':
                return $this->fallbackToInternal($e);
            default:
                return $this->logAndFail($e);
        }
    }
}
```

---

## 🧪 TESTING STRATEGY

### Test Pyramid
```
Contract Tests (Provider Level)
├── ACS API Response Parsing
├── Error Handling Scenarios
├── Idempotency Key Generation
└── Data Mapping Validation

Integration Tests (Service Level)
├── Provider Factory Selection
├── Fallback Mechanism
├── Retry Logic
└── Circuit Breaker

E2E Tests (User Journey)
├── Happy Path: Athens → Thessaloniki
├── Error Path: Invalid Address
├── Fallback Path: Provider Down
└── Performance: <2s Label Generation
```

### ACS Sandbox Test Cases
```json
{
  "test_cases": [
    {
      "name": "successful_label_creation",
      "request": "valid_athens_to_crete_shipment.json",
      "expected_response": "acs_label_created.json"
    },
    {
      "name": "invalid_postal_code",
      "request": "invalid_postal_code_shipment.json",
      "expected_error": "ACS_VALIDATION_ERROR"
    },
    {
      "name": "rate_limit_exceeded",
      "simulate": "100_requests_per_minute",
      "expected_behavior": "exponential_backoff"
    }
  ]
}
```

### Contract Test Implementation
```php
class AcsContractTest extends TestCase
{
    public function test_create_label_maps_to_internal_format()
    {
        $acsResponse = $this->loadFixture('acs_label_response.json');
        $provider = new AcsCourierProvider();

        $internalFormat = $provider->mapToInternalFormat($acsResponse);

        $this->assertArrayHasKey('tracking_code', $internalFormat);
        $this->assertArrayHasKey('label_url', $internalFormat);
        $this->assertArrayHasKey('carrier_code', $internalFormat);
        $this->assertEquals('ACS', $internalFormat['carrier_code']);
    }
}
```

---

## 🚀 ROLLOUT STRATEGY

### Feature Flag Configuration
```env
# Environment Variables
COURIER_PROVIDER=none          # none|acs|elta|speedex
COURIER_FALLBACK_ENABLED=true  # Enable fallback to internal provider
COURIER_CIRCUIT_BREAKER=true   # Enable circuit breaker pattern
COURIER_MAX_RETRIES=3          # Maximum retry attempts
```

### Rollout Phases
```
Phase 1: Internal Testing (Week 1)
├── Deploy with COURIER_PROVIDER=none
├── Run contract tests in staging
├── Verify fallback mechanisms
└── Performance baseline measurement

Phase 2: Sandbox Testing (Week 2)
├── Enable COURIER_PROVIDER=acs (staging only)
├── Process 100 test shipments
├── Monitor error rates and response times
└── Validate tracking info accuracy

Phase 3: Limited Production (Week 3)
├── Enable for 10% of orders (feature flag)
├── Monitor real-world performance
├── Compare with internal provider metrics
└── Collect user feedback

Phase 4: Full Rollout (Week 4)
├── Gradually increase to 100%
├── Disable internal provider
├── Monitor for 48 hours
└── Post-deployment review
```

### Monitoring & Alerting
```
Key Metrics:
├── Label Generation Success Rate (target: >99.5%)
├── Tracking Info Accuracy (target: >99%)
├── Response Time (target: <2s P95)
├── Error Rate by Provider (target: <0.5%)
└── Circuit Breaker Trips (alert on any)

Alerts:
├── Provider Error Rate >5% (15min window)
├── Response Time >5s (5min window)
├── Circuit Breaker Activated
└── Fallback Provider Used >10% (1hr window)
```

---

## 📊 SUCCESS CRITERIA

### Technical KPIs
- ✅ **Availability**: 99.9% uptime for shipping operations
- ✅ **Performance**: <2s P95 for label generation
- ✅ **Accuracy**: 99%+ tracking info accuracy
- ✅ **Reliability**: <0.1% permanent failure rate

### Business KPIs
- ✅ **Cost Reduction**: 20% lower shipping costs via ACS rates
- ✅ **User Experience**: Faster delivery estimates, real tracking
- ✅ **Operational**: Automated label printing, reduced manual work
- ✅ **Scalability**: Support 10x order volume growth

### Quality Gates
- ✅ **Zero Regressions**: Existing shipping flow unaffected
- ✅ **Error Handling**: Graceful degradation in all failure modes
- ✅ **Documentation**: Complete API docs + runbooks
- ✅ **Testing**: 95%+ test coverage for courier integration

---

## 🔮 FUTURE ROADMAP

### Phase 3: Multi-Provider Optimization
- **Rate Shopping**: Compare prices across ACS/ELTA/Speedex
- **Performance Routing**: Choose fastest provider per route
- **Load Balancing**: Distribute load across healthy providers

### Phase 4: Advanced Features
- **Real-time Tracking**: WebSocket updates for shipment status
- **Delivery Scheduling**: Customer-selected delivery windows
- **Return Management**: Automated return label generation
- **Analytics Dashboard**: Shipping performance insights

### Phase 5: International Expansion
- **EU Providers**: DHL, UPS, FedEx integration
- **Cross-border**: Customs documentation automation
- **Multi-currency**: Dynamic pricing in local currencies

---

## 📚 DOCUMENTATION REQUIREMENTS

### Technical Documentation
- **API Integration Guide**: Step-by-step ACS integration
- **Error Handling Runbook**: Troubleshooting guide for ops team
- **Provider Configuration**: Environment setup and feature flags
- **Monitoring Dashboard**: Grafana/Datadog integration guide

### Business Documentation
- **Cost Analysis**: ACS vs internal shipping cost comparison
- **SLA Documentation**: Provider uptime and performance guarantees
- **User Guide**: Updated shipping flow documentation
- **Risk Assessment**: Operational and technical risk mitigation

---

**📋 Next Steps**: Proceed to minimal spike implementation with provider abstraction skeleton, maintaining zero impact on existing shipping functionality.