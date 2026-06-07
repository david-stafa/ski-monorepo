/* 
    BE aware:
        - undefined values are filtered out of the object after JSON.stringify
    Use cases:
        - check if search params are equal to default search params
*/
export const areObjectsEqual = (obj1: object, obj2: object) => {
  return (
    JSON.stringify(
      Object.entries(obj1)
        .filter(([, value]) => value !== undefined && value !== null)
        .sort()
    ) ===
    JSON.stringify(
      Object.entries(obj2)
          .filter(([, value]) => value !== undefined && value !== null)
        .sort()
    )
  )
}
