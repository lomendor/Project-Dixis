# Dixis ERD (MVP)
```mermaid
erDiagram
  USER ||--o{ ORDER : places
  USER ||--o{ ADDRESS : has
  PRODUCER ||--o{ PRODUCT : lists
  PRODUCT ||--o{ PRODUCT_VARIANT : has
  ORDER ||--|{ ORDER_ITEM : contains
  ORDER ||--o{ SHIPMENT : ships
  SHIPMENT ||--o{ SHIPPING_RATE : uses
  ORDER ||--o{ PAYMENT : records
  USER ||--o{ MESSAGE : sends
```
