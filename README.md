# Mohawk PMS

## Preliminary Requirements

as part of the preliminary requirements, we must ensure that we are updating
shopify with the correct article master from CAMS/MPMS

the CAMS entity id is called an 'article_master' the 'article_master' is
_supposed to be_ (?) the SKU without the backing code

The problem is relating the article master in CAMS to the same resource in MPMS

This is a problem because we can't confidently know what a 'UPC' coming in to
our post products endpoint, refers to

invariants:

1. mohawk has a shopify ecommerce account
   - we are not in a position to remove this
   - all CC transactions must occur is this account (contract)

2. mohawk has an internal fulfillment warehouse platform (CAMS)
   - this is the source of truth for fulfillments and inventory

3. mohawk polls our api for orders GET /orders

4. CAMS sends product inventory to POST /products
   - every time we receive this message, it is the source of truth for all
     currently active saleable products

5. Mohawk has their own PMS (MPMS)
   - this does not communicate with CAMS
   - it is the source of truth for (unclear)

mohawk currently uses a shopify theme as the frontend

mohawk has 'the mohawk kiosk' that relies on shopify's data for it's source of
truth

## Problem

### Problems with shopify/shopify schema

1. liquid-templates performance is bad
2. merchandiseability w/r/t filtering, sorting
3. cross-cutting merchandiseability concerns
4. ability + facility

### Project functional requirements/needs

1. high lighthouse score (90+)
2. mobile focused
3. backing database
4. display logic
