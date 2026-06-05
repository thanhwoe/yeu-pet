# 08 — Out-of-Scope Policy

This refactor must not expand into Phase 2 features.

## Out-of-scope screens/routes

Skip these route files unless they break compilation:

```txt
app/cart.tsx
app/checkout.tsx
app/shipping-address.tsx
app/list-clinic.tsx
app/list-spa.tsx
app/products/*
app/training/*
```

Also skip related screens:

```txt
screens/Cart
screens/Checkout
screens/ShippingAddress
screens/ListClinic
screens/ListSpa
screens/ProductDetail
screens/Store
screens/Training
screens/TrainingLevel
```

## Out-of-scope components

Skip these unless needed for compile stability:

```txt
CartButton
ClinicCard
SpaCard
PetClinicList
QuantityInput
ProductDetailHeader
Store/product components
Training-related components
```

## Out-of-scope modules

Skip:

```txt
modules/vnpay
payment integrations
cart/checkout logic
store/ecommerce API integration
grooming/clinic appointment implementation
training document implementation
events
SOS
admin portal
```

## What “skip” means

Do not delete these files.
Do not deeply refactor these files.
Do not move these files unless necessary to avoid broken imports.

Instead:

- Leave them in place.
- Mark them as frozen in the audit.
- Remove them from active bottom tabs/navigation only if product scope requires it and it is safe.
- Keep route files compiling if they are still present.

## If an out-of-scope file imports refactored shared components

If a skipped file imports a component that was moved, update the import only. Do not rewrite the screen.

## If an out-of-scope feature blocks build

Minimal fix allowed:

- update import paths
- add compatibility export
- add temporary wrapper
- document the reason

Do not implement new behavior.

## Navigation policy

Bottom tabs for Phase 1 should focus on:

```txt
Home
Reminder
Services
Photos
Settings
```

Services may link to Phase 1 services only:

```txt
Medical Records
Budget
Sitter Booking
Pet Care AI
Notifications if needed
```

Phase 2 services may appear as disabled/coming soon cards only if product wants it. Do not implement their flows.

## Documentation requirement

In the final report, include:

```txt
Out-of-scope files intentionally skipped:
- path
- reason
- any minimal import changes made
```
