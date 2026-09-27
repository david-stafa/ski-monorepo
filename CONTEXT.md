# Ski Blažek

A ski and snowboard rental shop's back office: equipment inventory, fittings, and the reservations that hand that equipment out to customers.

## Language

**Season**:
The shop's year, running from 1 May to 30 April. The stock check (inventura) and seasonal reservations are both counted against it.
_Avoid_: Winter season, ski season, year

**Seasonal reservation**:
A reservation where the customer keeps the equipment for the rest of the Season, until the season return deadline. Staff decide this with the customer; it is not implied by how long the dates are.
_Avoid_: Season rental, long-term rental

**Regular reservation**:
Any reservation that is not a seasonal reservation, however long its dates are.
_Avoid_: Short-term reservation, non-seasonal reservation, normal reservation

**Season return deadline**:
The date seasonal equipment is due back, currently the end of March in the Season.
_Avoid_: Season end

**Reservation item**:
One piece of equipment booked for one person in a reservation. It is the unit the shop actually handles: each item is prepared, picked up and returned on its own.
_Avoid_: Booking, line, rental item

**Status**:
Where a reservation item, a person or a reservation is in its lifecycle: Booked → Prepared → Picked up → Returned, or Cancelled. Every reservation item passes through each status in order, never skipping one (a walk-in is still Prepared before it is Picked up). Staff may step an item back one status to undo a mistake. Cancelled is final: there is no way back from it.
_Avoid_: Stage, state, phase

**Booked**:
The equipment is promised to the customer for the dates, but nothing has been done with it yet.

**Prepared**:
The equipment is ready to hand over, with nothing left to do at the counter: taken off the shelf, bindings adjusted, serviced.
_Avoid_: Ready, set aside

**Picked up**:
The customer has taken the equipment out of the shop.
_Avoid_: Handed out, rented, issued

**Returned**:
The equipment is back in the shop. Returned equipment can be booked again immediately, even if the customer brought it back before the reservation's end date.

**Cancelled**:
The equipment will not go out on this reservation. Only something that is still Booked or Prepared can be cancelled. Once the equipment has been picked up, it can only end as Returned, even if it comes back early.
_Avoid_: Deleted, removed

**Overdue**:
A reservation item still Picked up after its reservation's end date has passed. On the end date itself the item is due, not overdue; it becomes overdue the next day. A person with no reservation items (renting only accessories) is overdue on the same terms, since their accessories are still out. A person or reservation is overdue when any of its items or people is, so one child's skis still out keep the whole family overdue after the parents have returned theirs. Seasonal reservations follow the same rule, since their end date is the season return deadline. Equipment that was never picked up is not overdue.
_Avoid_: Late, past due, unreturned

**Rolled-up status**:
A person's status is worked out from their reservation items, and a reservation's status from its people: it is the least advanced status among the ones not cancelled. A family where one ski has not been picked up yet is not Picked up. A person with no reservation items (someone renting only accessories) has no items to work it out from, so staff move that person through the statuses directly. A person or reservation becomes Cancelled only when staff cancel it, never because everything under it happens to be cancelled.
_Avoid_: Overall status, summary status

**Accessories**:
Poles, goggles, back protection and ski or boot covers rented to a person. They have no status of their own; they go out and come back with the person.
_Avoid_: Extras, add-ons
