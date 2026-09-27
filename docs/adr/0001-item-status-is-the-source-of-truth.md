# Reservation item status is the source of truth; person and reservation statuses are stored roll-ups

A reservation item, a person and a reservation each have their own stored status column, even though the person's and the reservation's status can almost always be worked out from what's below them. We store them because the reservation lists (the prep view, the pick-up sheet, returns) filter by status, and Prisma can't filter on a computed value. Letting staff set all three independently was rejected because the levels could then disagree. So the item is the source of truth, and every status change goes through one roll-up that recomputes the person and then the reservation in the same transaction. A parent's status is never written directly, with two exceptions: a person with no active items (accessories only) is moved by hand like an item, and Cancelled on a person or reservation comes only from an explicit cancel, never from the roll-up.

## Consequences

- Any code that changes an item's status, or adds or cancels items, must run the roll-up afterwards, or the stored parent statuses go stale.
- Availability reads only the item status: Booked, Prepared and Picked up occupy the equipment; Returned and Cancelled free it.
