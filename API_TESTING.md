# API Testing with curl

This document provides examples of testing the PocketFridge API using curl.

## Health Check

```bash
curl http://localhost:3000/api/health
```

## Fridge Endpoints

### Create a fridge

```bash
curl -X POST http://localhost:3000/api/fridges \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Fridge", "location": "Kitchen"}'
```

### Get all fridges

```bash
curl http://localhost:3000/api/fridges
```

### Get a specific fridge

```bash
curl http://localhost:3000/api/fridges/1
```

### Update a fridge

```bash
curl -X PUT http://localhost:3000/api/fridges/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Fridge", "location": "Kitchen"}'
```

### Delete a fridge

```bash
curl -X DELETE http://localhost:3000/api/fridges/1
```

### Get items in a fridge

```bash
curl http://localhost:3000/api/fridges/1/items
```

## Item Endpoints

### Create an item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "fridge_id": 1,
    "name": "Milk",
    "quantity": 2,
    "unit": "L",
    "category": "Dairy",
    "expiry_date": "2026-02-15",
    "notes": "Whole milk"
  }'
```

### Get all items

```bash
curl http://localhost:3000/api/items
```

### Get a specific item

```bash
curl http://localhost:3000/api/items/1
```

### Update an item

```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Milk",
    "quantity": 1,
    "unit": "L",
    "category": "Dairy",
    "expiry_date": "2026-02-15",
    "notes": "Almost empty"
  }'
```

### Delete an item

```bash
curl -X DELETE http://localhost:3000/api/items/1
```

### Get items expiring soon (within 7 days)

```bash
curl http://localhost:3000/api/items/expiring/7
```

## Testing Workflow

1. Start the server:
   ```bash
   npm start
   ```

2. In another terminal, test the endpoints:
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Create a fridge
   curl -X POST http://localhost:3000/api/fridges \
     -H "Content-Type: application/json" \
     -d '{"name": "My Fridge", "location": "Kitchen"}'
   
   # Add an item (replace fridge_id with the ID from previous response)
   curl -X POST http://localhost:3000/api/items \
     -H "Content-Type: application/json" \
     -d '{
       "fridge_id": 1,
       "name": "Eggs",
       "quantity": 12,
       "unit": "pcs",
       "category": "Dairy",
       "expiry_date": "2026-02-20"
     }'
   
   # Get all items in the fridge
   curl http://localhost:3000/api/fridges/1/items
   ```

## Using JSON formatting

For better readability, pipe the output through `jq`:

```bash
curl http://localhost:3000/api/fridges | jq
```

Or use Python for formatting:

```bash
curl http://localhost:3000/api/fridges | python -m json.tool
```
