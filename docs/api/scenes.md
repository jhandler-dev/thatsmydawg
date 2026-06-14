# /api/scenes

## GET /api/scenes
Returns active scenes for the storefront grid, ordered by `sortOrder`. No auth.

**Response** `200 OK`
```json
{
  "scenes": [
    {
      "id": "clx...",
      "slug": "bar-dog",
      "name": "Bar Dog",
      "description": "Cap on backwards, beer in paw, dive bar of their dreams.",
      "priceCents": 4495,
      "shirtColor": "Faded Black",
      "badge": "Best Seller",
      "sceneImageUrl": "https://.../bar-dog.png"
    }
  ]
}
```

**Notes**
- Only `active = true` scenes are returned.
- Seeded from a seed script (the draft's `SHIRTS` array → DB rows).
